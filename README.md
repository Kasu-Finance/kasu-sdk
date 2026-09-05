# Kasu SDK

[![npm version](https://img.shields.io/npm/v/@kasufinance/kasu-sdk.svg)](https://www.npmjs.com/package/@kasufinance/kasu-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/Kasu-Finance/kasu-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Kasu-Finance/kasu-sdk/actions/workflows/ci.yml)

`@kasufinance/kasu-sdk` is the TypeScript SDK for the Kasu Finance protocol —
real-world credit funded on-chain. It wraps the core contracts, the subgraphs
and the CMS behind one object, so an application can list lending strategies,
read a lender's positions and submit KYC-gated deposits and withdrawals without
re-implementing the plumbing. It also ships a pure domain layer: the rate,
tranche and pool rules every Kasu frontend agrees on, as numbers rather than
copy.

## Installation

```bash
npm install @kasufinance/kasu-sdk
```

The SDK is built against **ethers v5** and resolves to the ethers already in
your project — it is marked external in the published bundle, so there is only
ever one copy in the tree. ethers v6 is not supported.

## Requirements

- **Node 18 or later**, or any runtime with a global `fetch` (all modern
  browsers, Deno, Bun, edge runtimes). No XHR polyfill is needed.
- **A provider or signer** — optional. Without one the SDK builds a read-only
  provider from the chain's default RPC; pass your own to control the endpoint,
  and a signer to send transactions.

## Quick start

```ts
import {
    Kasu,
    fetchUnusedPoolIds,
    netEffectiveApy,
} from '@kasufinance/kasu-sdk';
import { parseUnits } from 'ethers/lib/utils';

// Read-only. No wallet, no provider — uses the chain's default public RPC.
const kasu = Kasu.create({ chain: 'base' });

// The strategies a lender should see: active, not oversubscribed, capacity first.
const strategies = await kasu.strategies.getVisible();

// Rates are NET of the platform performance fee. `getPerformanceFeePercent()`
// returns a percentage in 0..100 (10 = ten percent), never a fraction.
const feePercent = await kasu.strategies.getPerformanceFeePercent();
for (const s of strategies) {
    const net = netEffectiveApy(s.tranches[0].apy, feePercent);
    console.log(s.name, `${(net * 100).toFixed(2)}% p.a. net`);
}

// Optional: hide pools that have no published content yet.
const readOnly = Kasu.create({
    chain: 'base',
    configOverrides: { UNUSED_LENDING_POOL_IDS: await fetchUnusedPoolIds() },
});

// Writes need a signer. `connect` returns a NEW instance; the read-only one
// keeps working.
// signer: an ethers v5 Signer from your wallet library
const signed = kasu.connect(signer);
const strategy = strategies[0];
const kycParams = signed.deposits.buildKycParams('0xYourAddress');
// blockExpiration, signature: obtained from your KYC backend using kycParams
const tx = await signed.deposits.deposit({
    poolId: strategy.id,
    trancheId: strategy.tranches[0].id,
    amount: parseUnits('1000', kasu.chainConfig.stableAsset.decimals),
    kycSignature: { blockExpiration, signature },
});

// Positions and yield (read-only is enough).
const positions = await kasu.portfolio.getPositions('0xUserAddress');
```

Calling a write method on a read-only instance throws before it touches the
contract: `Kasu: this instance is read-only; call kasu.connect(signer) first`.

## Supported deployments

Each deployment lends in exactly one stable token. A different token means a
separate deployment, not a second vault.

| Chain key  | Network            | Chain ID | Type | Stable asset | Subgraph               | Status                        |
| ---------- | ------------------ | -------- | ---- | ------------ | ---------------------- | ----------------------------- |
| `base`     | Base Mainnet       | 8453     | Full | USDC         | `kasu-base/v1.0.13`    | Production                    |
| `xdc`      | XDC Mainnet        | 50       | Lite | AUDD         | `kasu-xdc/v1.0.0`      | Production                    |
| `xdc-usdc` | XDC Mainnet (USDC) | 50       | Lite | USDC         | `kasu-xdc-usdc/v1.0.0` | Production, separate stack    |
| `plume`    | Plume Mainnet      | 98866    | Lite | pUSD         | legacy project         | Retired — frozen history only |

Full deployments have the KSU token, locking and loyalty rewards; Lite
deployments have lending only. `plume` is wound down: it has no default RPC, so
a read-only `Kasu.create({ chain: 'plume' })` throws — pass your own provider to
read its history.

Every entry lives in `CHAIN_CONFIGS`, including contract addresses, subgraph
URLs, the stable asset and public RPC defaults:

```ts
import { CHAIN_CONFIGS } from '@kasufinance/kasu-sdk';

CHAIN_CONFIGS.base.stableAsset; // { address, symbol, name, decimals, currencyCode }
CHAIN_CONFIGS.xdc.rpcUrls; // starting preference only — override with your own
```

You can also pass a whole `ChainConfigEntry` instead of a chain key.

## Facade API overview

| Facade            | Methods                                                                                                                 | Purpose                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `kasu.strategies` | `getAll()`, `getVisible()`, `getById()`, `getPlatformStats()`, `getPerformanceFeePercent()`, `calculateDepositLimits()` | Browse pools, APY, capacity     |
| `kasu.deposits`   | `deposit()`, `withdraw()`, `withdrawMax()`, `buildKycParams()`, `isClearingPending()`                                   | Submit transactions             |
| `kasu.portfolio`  | `getPositions()`, `getTransactionHistory()`, `getRequestStates()`                                                       | Lender balances, yield, history |

On the instance itself: `kasu.connect(signer)`, `kasu.isReadOnly`,
`kasu.provider`, `kasu.chainConfig`, `kasu.isLiteDeployment`, and
`kasu.services` for the low-level services below.

`fetchUnusedPoolIds(directusUrl?)` reads the pool ids that are configured but
not yet published, for `configOverrides.UNUSED_LENDING_POOL_IDS`. It may
return an empty list; pass it straight through. `SdkConfig` normalises an empty
exclusion list to `['']`, because the subgraph reads `id_not_in: []` as "match
nothing" and would otherwise hide every pool.

## Domain helpers

Pure functions shared by every Kasu frontend. They return **numbers and codes,
never copy** — no locale, no `Intl`, no user-facing strings — so each
application formats them in its own design system and language.

| Module               | Exports                                                                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rates                | `EPOCHS_IN_YEAR`, `epochRateToApy`, `apyToEpochRate`, `netEffectiveApy`                                                                                                                                  |
| Tranches             | `trancheHasCapacity`, `poolAllTranchesFull`, `derivePoolStatus`, `trancheRiskRank`, `compareTrancheSeniority`, `pickDefaultTrancheId`, `trancheApyBounds`, `netTrancheApyBounds`, `MIN_TRANCHE_CAPACITY` |
| Deposit bounds       | `resolveDepositBounds`, `resolveBoundShortcuts`, `isBelowMinimumCapacity`, `parseTrancheBound`, `floorToCents`, `ceilToCents`                                                                            |
| Pools                | `selectVisiblePools`, `poolMaxApy`, `pickHighestYieldTranche`, `maxNetRateCeiling`                                                                                                                       |
| Partners             | `getCreditOriginator`, `getInstitutionalLender`, `APXIUM`, `INVOICEMATE`, `RIXON_CAPITAL`                                                                                                                |
| Tranche display name | `getTrancheDisplayName`, `UPPER_MEZZANINE`                                                                                                                                                               |
| Requests             | `deriveRequestState`, `submissionEvents`, `countSubmissions`, `firstSubmissionTimestamp`, `isCycleClosed`                                                                                                |
| Settlement           | `computeSettlementWindow`, `nextCycleBoundary`, `deriveCycleDates`, `CLEARING_WINDOW_SECONDS`                                                                                                            |
| Loan contract        | `encodeDepositData`, `buildContractVersionType`, `buildLoanAgreementSignMessage`, `buildLegacyContractRequestMessage`, `buildFullNameRequestMessage`, `formatSignTimestampUtc`, `parseFormattedMessage`, `asContractType` |
| Wallet errors        | `isUserRejected`, `isUnpredictableGas`                                                                                                                                                                   |
| AU minimum           | `auMinimumRemaining`, `isAustralianKyc`, `auThresholdFor`, `isAuMinimumExempt`, `parseMinorUnits`, `AU_ALPHA3`, `AU_MIN_CUMULATIVE_BY_STABLE`                                                            |

Three rules worth knowing:

- **Protocol strings are the exception to "never copy".** The messages
  `loan-contract` builds are reconstructed byte-for-byte by the Kasu backend to
  verify a lender's signature, and `encodeDepositData` produces bytes that go
  on chain. They are not text to translate or tidy: a changed word, separator
  or date format stops signatures verifying. Everything else in this layer is
  numbers and codes.
- **Rates fail closed.** `netEffectiveApy`, `netTrancheApyBounds` and
  `maxNetRateCeiling` return `NaN` / `null` rather than a plausible-looking
  wrong number when an input is out of domain. Render that as "no rate", never
  as zero, and never substitute a fee of `0` for one you have not loaded — a
  fee-less rate overstates what a lender earns.
- **The tranche rename is display-only.** `getTrancheDisplayName` maps the
  `Senior` tranche to "Upper Mezzanine" on Apxium strategies, because the true
  senior position is held by an institutional lender. Call it at the view
  boundary only: ranking, matching and sorting keep the raw on-chain name —
  which is why `deriveRequestState` returns `trancheName` raw.

## Low-level `KasuSdk`

Most integrators should use the `Kasu` facade. For locking, swaps, NFTs and
anything the facade does not cover, reach the services directly — either
through `kasu.services` or by constructing `KasuSdk` with your own `SdkConfig`
(see `CHAIN_CONFIGS` in `src/facade/chain-configs.ts` for a complete example of
every field).

```ts
import { KasuSdk, SdkConfig, CHAIN_CONFIGS } from '@kasufinance/kasu-sdk';

const config = new SdkConfig({
    subgraphUrl: CHAIN_CONFIGS.base.subgraphUrl,
    contracts: CHAIN_CONFIGS.base.contracts,
    directusUrl: CHAIN_CONFIGS.base.directusUrl,
    UNUSED_LENDING_POOL_IDS: [],
    isLiteDeployment: false,
    stableAssetDecimals: CHAIN_CONFIGS.base.stableAsset.decimals,
});

// provider: an ethers v5 Provider or Signer
const sdk = new KasuSdk(config, provider);
// currentEpochId: from `await kasu.deposits.getCurrentEpoch()`
const pools = await sdk.DataService.getPoolOverview(currentEpochId);
```

| Service       | Purpose                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------- |
| `DataService` | On-chain pool data (subgraph, external TVL) plus CMS content — descriptions, KPIs, imagery. |
| `Locking`     | KSU locking: periods, projected rewards, lock/unlock, claim fees. Full deployments only.    |
| `UserLending` | Deposit and withdrawal requests, transaction history, CSV builders.                         |
| `Portfolio`   | Balances, rewards, lending totals, APY.                                                     |
| `Swapper`     | Calls through the on-chain swapper.                                                         |

Every method is typed, so an editor discovers the shape of `PoolOverview`,
`LockPeriod`, `PortfolioRewards` and the rest without reading the source.

## Lite deployment behaviour

With `isLiteDeployment: true`, KSU-related functionality degrades predictably
rather than throwing at random:

| Method                                          | Full deployment       | Lite deployment                      |
| ----------------------------------------------- | --------------------- | ------------------------------------ |
| `Locking.lockKSUTokens()`                       | Works normally        | Throws                               |
| `Locking.getUserTotalLockedAmount()`            | Returns locked amount | Returns `'0'`                        |
| `Locking.getLoyaltyLevelAndApyBonusFromRatio()` | Calculates the level  | Returns level 0, 0% bonus            |
| `Locking.getKasuEpochTokenPrice()`              | Returns the price     | Returns `{ price: 0, decimals: 18 }` |
| `Portfolio.getUserNfts()`                       | Returns NFT ids       | Returns `[]`                         |
| `Portfolio.getPortfolioRewards()`               | Returns rewards       | Returns zeros                        |

Applications should hide KSU surfaces — the locking panel, loyalty badges, KSU
rewards — when `kasu.isLiteDeployment` is true.

## Development

```bash
npm ci
npm run build-tc     # regenerate typechain factories from abis/
npm run build        # eslint + tsc
npm run rollup-build # bundle to dist/
npm run test:unit    # the offline suites — the fast loop, and what CI runs
npm test             # the same suites; the live specs skip unless LIVE_TESTS=1
npm run test:live    # opt-in: the specs that reach real subgraphs and RPCs
```

Everything outside `src/tests/` is offline and fast. `src/tests/` holds the
specs that talk to live networks; they are skipped unless `LIVE_TESTS=1`, so a
network problem cannot fail a pull request that did not touch the network.

CI runs `build-tc`, `build`, `test:unit` and `rollup-build` on every pull
request.

## Versioning & publishing

The package follows semantic versioning. The published runtime entry is the
rollup bundle (`dist/bundle.cjs.js` / `dist/bundle.esm.js`), which
`prepublishOnly` rebuilds — so when verifying a release, check the contents of a
packed tarball rather than the version number alone.

Publishing is manual and is done by a member of the npm organisation; the
tag workflow only verifies that a pushed `vX.Y.Z` tag matches `package.json`.

## Support

- Issues: <https://github.com/Kasu-Finance/kasu-sdk/issues>
- Developer documentation: <https://devdocs.kasu.finance>
- Product documentation: <https://docs.kasu.finance>

## License

MIT — see [LICENSE](./LICENSE).
