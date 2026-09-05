# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@kasufinance/kasu-sdk` is the shared TypeScript SDK for Kasu frontends. It provides:

- Contract wrappers (ethers.js v5) for all Kasu smart contracts
- Subgraph queries for pool data, user positions, and locking info
- Directus CMS integration for pool descriptions and KPIs
- Portfolio calculations (APY, yield, rewards)
- A pure domain layer of shared rate/tranche/pool rules
- Support for both Full (Base) and Lite (XDC) deployments

**Version:** see `package.json`. `prepublishOnly` runs `build` + `rollup-build`,
and the runtime entry is the rollup bundle — not the `tsc` output. When
verifying that a release actually shipped a change, unpack the published tarball
and read `dist/bundle.cjs.js`; a bumped version number proves nothing on its
own, because a stale bundle can be published with a fresh version.

This is a PUBLIC repository and a public npm package. Nothing internal belongs
in it: no infrastructure details, no vendor commercial terms, no operational
addresses, no people's names.

## Build Commands

```bash
npm install          # Install dependencies
npm run build-tc     # Regenerate typechain factories from ABIs
npm run build        # Lint + TypeScript compile
npm run rollup-build # Build distribution bundles
npm test             # Run Jest tests
npm run lint         # Fix lint issues
```

## Architecture

### Directory Structure

```
src/
├── contracts/           # Typechain-generated contract bindings
│   ├── factories/       # Contract factory classes
│   └── *.ts             # Contract type definitions
├── domain/              # Pure shared rules — numbers and codes, never copy
│   ├── rates.ts         # EPOCHS_IN_YEAR, epoch↔APY, netEffectiveApy
│   ├── tranches.ts      # Capacity, seniority, pool status, APY bounds
│   ├── deposit-bounds.ts# Min/max deposit, cent snapping
│   ├── pools.ts         # Visible-pool selection, best tranche, rate ceiling
│   ├── partners.ts      # Credit originator / institutional lender
│   └── tranche-display-name.ts  # The one display-only rename
├── facade/              # High-level integrator API (Kasu, chain configs, I/O)
├── services/
│   ├── DataService/     # Pool data, subgraph queries, Directus
│   ├── Locking/         # KSU locking, loyalty levels, rewards
│   ├── Portfolio/       # User portfolio, balances, yields
│   ├── Swapper/         # Token swap helpers
│   └── UserLending/     # Deposit/withdraw, transaction history
├── utils/
│   └── deployment-mode.ts  # Lite/Full mode detection utility
├── index.ts             # Main exports (KasuSdk class)
└── sdk-config.ts        # Configuration types and SdkConfig class
```

### Key Files

| File                                       | Purpose                                             |
| ------------------------------------------ | --------------------------------------------------- |
| `src/sdk-config.ts`                        | `SdkConfig` class and `ContractAddresses` interface |
| `src/index.ts`                             | `KasuSdk` main class, exports all services          |
| `src/services/Locking/locking.ts`          | KSU locking service with Lite mode guards           |
| `src/services/Portfolio/portfolio.ts`      | Portfolio aggregation service                       |
| `src/services/DataService/data-service.ts` | Subgraph + Directus data fetching                   |
| `src/services/UserLending/user-lending.ts` | User deposit/withdraw operations                    |
| `src/utils/deployment-mode.ts`             | `isLiteDeployment()` utility                        |

---

## Multi-Chain Support

### Supported Networks

| Chain key  | Network            | Chain ID | Type | Stable asset | Status                                     | Subgraph               |
| ---------- | ------------------ | -------- | ---- | ------------ | ------------------------------------------ | ---------------------- |
| `base`     | Base Mainnet       | 8453     | Full | USDC         | Production                                 | `kasu-base/v1.0.13`    |
| `xdc`      | XDC Mainnet (AUDD) | 50       | Lite | AUDD         | Production                                 | `kasu-xdc/v1.0.0`      |
| `xdc-usdc` | XDC Mainnet (USDC) | 50       | Lite | USDC         | Production (separate stack, same chain id) | `kasu-xdc-usdc/v1.0.0` |
| `plume`    | Plume Mainnet      | 98866    | Lite | pUSD         | Retired — drained; frozen history only     | legacy Goldsky project |

One deployment lends in exactly ONE stable token. A different stable token is a
separate full deployment (the XDC AUDD / XDC USDC pattern), never a second vault
on an existing one.

### Full vs Lite Deployments

**Full Deployment** (Base mainnet):

- KSU token, locking, loyalty rewards enabled
- `KSUToken` and `KasuNFTs` contract addresses required
- `isLiteDeployment: false`

**Lite Deployment** (XDC):

- No KSU token or locking features
- KYC/KYB deposits still work
- `KSUToken` and `KasuNFTs` are `undefined`
- `isLiteDeployment: true`
- Locking methods return empty/zero values
- Transaction methods throw descriptive errors

### Feature Matrix

| Feature             | Full (Base)    | Lite (XDC)     |
| ------------------- | -------------- | -------------- |
| KSU Token           | Yes            | No             |
| KSU Locking         | Yes            | No             |
| Loyalty Levels      | Yes            | No             |
| APY Bonus           | Yes            | No             |
| NFT Boosts          | Yes            | No             |
| KYC/KYB Deposits    | Yes            | Yes            |
| Lending Pools       | Yes            | Yes            |
| Fixed Term Deposits | Yes            | Yes            |
| Pool Descriptions   | Yes (Directus) | Yes (Directus) |

---

## SDK Configuration

### ContractAddresses Interface

```typescript
export interface ContractAddresses {
    /** Only on Full deployments (Base) */
    KSUToken?: string;
    /** Only on Full deployments */
    KasuNFTs?: string;

    // Always required
    IKSULocking: string;
    IKSULockBonus: string;
    UserManager: string;
    LendingPoolManager: string;
    KasuAllowList: string;
    SystemVariables: string;
    UserLoyaltyRewards: string;
    KsuPrice: string;
    ClearingCoordinator: string;
    ExternalTVL: string;
}
```

### SdkConfigOptions Interface

```typescript
export interface SdkConfigOptions {
    subgraphUrl: string;
    contracts: ContractAddresses;
    directusUrl?: string;
    UNUSED_LENDING_POOL_IDS: string[];
    isLiteDeployment?: boolean; // default: false
    poolMetadataMapping?: Record<string, string>;
    stableAssetDecimals?: number; // default: 6
}
```

### Empty-exclusion-list normalisation

`SdkConfig` rewrites an EMPTY `UNUSED_LENDING_POOL_IDS` to `['']`. The subgraph
reads `id_not_in: []` as "match nothing", not "exclude nothing" — an empty list
returns ZERO pools (verified live on Base 2026-09-04: `[]` → 0 pools, `['']` →
9). Every consumer used to carry its own sentinel workaround. A sentinel the
caller supplies is left untouched.

Use `fetchUnusedPoolIds()` to read the list from Directus instead of hard-coding
it — a pool then goes live without a frontend release:

```typescript
const kasu = Kasu.create({
    chain: 'base',
    configOverrides: { UNUSED_LENDING_POOL_IDS: await fetchUnusedPoolIds() },
});
```

### ChainConfigEntry

`CHAIN_CONFIGS` (`src/facade/chain-configs.ts`) carries, per chain: `chainId`,
`name`, `isLiteDeployment`, `contracts`, `subgraphUrl`, `directusUrl`,
`unusedPoolIds`, `poolMetadataMapping`, plus

- `stableAsset` — `{ address, symbol, name, decimals, currencyCode }`. The one
  token the deployment lends in. `Kasu.create` feeds `decimals` into
  `SdkConfig.stableAssetDecimals`.
- `rpcUrls` — public read-only endpoints, STARTING preference only; apps
  override with their own and their own failover. Never `rpc.xdc.org` or
  `erpc.xdc.org`: they answer OPTIONS without `access-control-allow-origin`, so
  browser calls hang on preflight.
- `retired` — true for a wound-down deployment. It has no default RPC, so a
  read-only `Kasu.create` on it throws.

### Read-only create and `connect`

`signerOrProvider` is optional. Without one, `Kasu.create` builds a
`StaticJsonRpcProvider` on `rpcUrls[0]` pinned to the config's chain id, and the
instance is read-only:

```typescript
const kasu = Kasu.create({ chain: 'base' }); // read-only
const signed = kasu.connect(signer); // NEW instance, same config, writable
```

`connect` mirrors ethers' `contract.connect`: it does not mutate the receiver.
`kasu.isReadOnly` and `kasu.provider` report what the instance holds. Write
methods on a read-only instance throw
`Kasu: this instance is read-only; call kasu.connect(signer) first` BEFORE
touching the contract.

---

## Domain Layer

`src/domain/` holds the rules every Kasu frontend must agree on. Before 2.5.0
they were duplicated across the applications, and the copies drifted.

**Two rules govern what may live there.**

1. **Numbers and codes only — never copy.** No locale, no `Intl`, no string a
   user reads. `netEffectiveApy` returns `0.196`, not `'19.60% p.a.'`;
   `derivePoolStatus` returns the code `'Full'`, not a sentence. Formatting
   belongs to each application, where the design system and the visitor's
   language are. The single exception is `getTrancheDisplayName` (below), which
   is here precisely so it CANNOT drift.
2. **Pure.** No network, no clock, no environment. Anything with I/O goes in
   `src/facade/` — `fetchUnusedPoolIds` is the example.

| Module                    | What it owns                                                                      |
| ------------------------- | --------------------------------------------------------------------------------- |
| `rates.ts`                | `EPOCHS_IN_YEAR`, `epochRateToApy`, `apyToEpochRate`, `netEffectiveApy`           |
| `tranches.ts`             | Capacity gate, seniority ranking, default pick, pool status, gross/net APY bounds |
| `deposit-bounds.ts`       | Min/max deposit, the Min/Max shortcut values, cent snapping                       |
| `pools.ts`                | Visible-pool selection and sort, best tranche, max net rate ceiling               |
| `partners.ts`             | Credit originator and institutional lender, inferred from the pool name           |
| `tranche-display-name.ts` | The Senior → "Upper Mezzanine" rename                                             |

### The `feePercent` units rule

`DataService.getPerformanceFee()` and
`StrategiesFacade.getPerformanceFeePercent()` return a **percentage in 0..100**
— `10` means ten percent. It is NOT a `0.10` fraction. Feed it to
`netEffectiveApy` as-is. Treating it as a fraction computes `r · (1 − 10)` and
yields a nonsense negative rate that still renders as a plausible-looking
percentage, which is why every such parameter is named `feePercent` and why
values outside 0..100 return `NaN`.

Rate helpers FAIL CLOSED: `netEffectiveApy` returns `NaN`, and
`netTrancheApyBounds` / `maxNetRateCeiling` return `null`, rather than a wrong
number. A caller that has not loaded the fee must render its "no rate" state —
never substitute `0`, which overstates what a lender earns with nothing on
screen saying so.

### The tranche rename is display-only

`getTrancheDisplayName` maps the on-chain `Senior` tranche to **"Upper
Mezzanine"** on Apxium strategies, because the true senior position is held by
an institutional lender. Call it at the view-model boundary ONLY. Ranking,
matching and sorting — `trancheRiskRank`, `compareTrancheSeniority`,
`pickDefaultTrancheId` — read the RAW subgraph name and must keep doing so; a
display name that reached them would silently reorder the risk waterfall.

## Contract Addresses by Chain

Every address, subgraph URL, stable asset and RPC default lives in
`CHAIN_CONFIGS` (`src/facade/chain-configs.ts`) — that file is the single
source of truth, and this guide deliberately does not copy it. Read it there:

```typescript
import { CHAIN_CONFIGS } from '@kasufinance/kasu-sdk';

CHAIN_CONFIGS.base.contracts;
CHAIN_CONFIGS['xdc-usdc'].subgraphUrl;
CHAIN_CONFIGS.xdc.stableAsset;
```

The Plume subgraph is indexed on a legacy Goldsky project; the URL carried in
`CHAIN_CONFIGS.plume` 404s on the current project. It is history-only, so
nothing reads it.

---

## Lite Mode Implementation

### Guard Pattern

When modifying services, check for Lite mode before accessing KSU-related functionality:

```typescript
// In service constructor
this._isLiteDeployment = config.isLiteDeployment;

// In methods that return data (silent fallback)
async getUserLockedAmount(address: string): Promise<string> {
    if (this._isLiteDeployment) {
        return '0';  // Return safe default
    }
    // ... normal implementation
}

// For transaction methods (throw error)
async lockTokens(amount: BigNumber): Promise<TransactionResponse> {
    if (this._isLiteDeployment) {
        throw new Error('Locking is not available on Lite deployments');
    }
    // ... normal implementation
}
```

### Lite Mode Behavior by Service

**Locking Service** (47+ guard clauses):
| Method | Lite Behavior |
|--------|---------------|
| `lockKSUTokens()` | Throws error |
| `unlockKSU()` | Throws error |
| `getUserLocks()` | Returns `[]` |
| `getUserTotalLockedAmount()` | Returns `'0'` |
| `getLoyaltyLevelAndApyBonusFromRatio()` | Returns `{ loyaltyLevel: 0, apyBonus: 0 }` |
| `getClaimableRewards()` | Returns `BigNumber.from(0)` |
| `getAvailableKsuBonus()` | Returns `'0'` |
| `getKasuEpochTokenPrice()` | Returns `{ price: 0, decimals: 18 }` |

**Portfolio Service** (6+ guard clauses):
| Method | Lite Behavior |
|--------|---------------|
| `getUserNfts()` | Returns `[]` |
| `getPortfolioRewards()` | Returns zeros for KSU-related fields |

**UserLending Service** (0 guard clauses):

- All lending operations work identically on all chains
- KYC/KYB deposit flows supported

**DataService** (0 guard clauses):

- Pool data queries are chain-agnostic
- Works on any subgraph

**Swapper Service** (0 guard clauses):

- Swap operations identical across chains

---

## Contract ABIs

ABIs are stored in `abis/*.json`. When contract interfaces change:

1. Copy new ABI JSON files to `abis/`
2. Run `npm run build-tc` to regenerate typechain bindings
3. Update service code if method signatures changed

### ABI Files (21 total)

```
Core Lending:
├── ILendingPoolManager.abi.json
├── ILendingPool.abi.json
├── ILendingPoolTranche.abi.json
├── ILendingPoolFactory.abi.json

KSU Locking/Rewards:
├── IKSULocking.abi.json
├── KSULockBonus.abi.json
├── IUserLoyaltyRewards.abi.json
├── IKsuPrice.abi.json

User Management:
├── IUserManager.abi.json
├── IKasuAllowList.abi.json

System:
├── ISystemVariables.abi.json
├── IClearingCoordinator.abi.json

Full Deployments Only:
├── IKasuNFTs.abi.json

Other:
├── IERC20Metadata.abi.json
├── Swapper.abi.json
├── KasuPoolExternalTVL.abi.json
└── IKasuController.abi.json
```

---

## Testing

```bash
npx jest src/domain         # Domain layer — pure, no network, fast
npx jest src/facade/config.test.ts   # Chain config, read-only create, connect
npm test                    # Everything, including specs that hit live networks
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report
```

Tests use Jest and live beside the code they cover. `src/tests/*.test.ts` reach
real subgraphs and RPCs, so they are unsuitable for a quick loop and can fail on
a network problem rather than a code one — prefer the two targeted commands
above while developing.

Property tests use `fast-check` (a devDependency).

---

## Publishing

Version is in `package.json`. The SDK is published to npm as
`@kasufinance/kasu-sdk`. Publishing is manual, by a member of the npm
organisation; CI verifies a pushed `vX.Y.Z` tag matches `package.json` but does
not publish.

```bash
# Before publishing:
npm run build-tc     # Regenerate typechain
npm run build        # Type-check + lint
npm run rollup-build # Build bundles
npx jest src/domain  # Domain tests

# Publish:
npm version patch|minor|major
npm publish
```

`files` in `package.json` limits the tarball to `dist`, `src`, `abis`, the
README and the LICENSE. `src` MUST stay published: a consumer deep-imports
`@kasufinance/kasu-sdk/src/contracts`.

---

## Related Repositories

| Repository       | Relationship                              |
| ---------------- | ----------------------------------------- |
| `kasu-ui`        | Primary consumer (production lender app)  |
| `kasu-fe-next`   | Legacy consumer (frozen, bugfixes only)   |
| `kasu-app-admin` | Consumer — reinstalls after every publish |
| `kasu-mobile`    | Consumer — reinstalls after every publish |
| `kasu-contracts` | Source of ABIs and contract logic         |
| `kasu-subgraph`  | Source of subgraph schema and queries     |

---

## Adding a New Chain

1. **Determine deployment type**: Full (has KSU token) or Lite (no KSU token)

2. **Deploy contracts** via kasu-contracts:

    - For Lite: Deploy all contracts except KSU, KasuNFTs
    - Record addresses in `.openzeppelin/<chain>-addresses.json`

3. **Deploy subgraph** via kasu-subgraph:

    - Create chain config in `src/config/<chain>.json`
    - Deploy to Goldsky
    - Note subgraph URL

4. **No SDK changes needed** if contracts match existing ABIs:

    - SDK already supports `isLiteDeployment` flag
    - Just configure frontend with new chain config

5. **SDK config**: add an entry to `CHAIN_CONFIGS`
   (`src/facade/chain-configs.ts`) with the contracts, subgraph URL,
   `stableAsset` and `rpcUrls`, then extend the `SupportedChain` union.

6. **Consumers**: add the chain to each application's own chain list and chain
   switcher. Nothing else is needed — they read addresses from `CHAIN_CONFIGS`.

7. **If new ABIs are needed**:
    - Copy ABIs to `abis/`
    - Run `npm run build-tc`
    - Update services if signatures changed
    - Publish a new SDK version

---
