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
npm ci               # Install dependencies from the lockfile
npm run build-tc     # Regenerate typechain factories from ABIs
npm run build        # Lint + TypeScript compile
npm run rollup-build # Build distribution bundles
npm run test:unit    # The offline suites — the fast loop, and what CI runs
npm test             # Same, with the live specs skipped unless LIVE_TESTS=1
npm run test:live    # Opt-in: the specs that reach real subgraphs and RPCs
npm run lint         # Fix lint issues
```

`dependencies` holds only what the package needs at runtime — `@directus/sdk`,
`axios`, `ethers`, `graphql-request`. Everything else is a devDependency; a
build/lint/test tool must never land in `dependencies`, because every consumer
then installs it transitively.

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
│   ├── tranche-display-name.ts  # The one display-only rename
│   ├── requests.ts      # Lending-request view model as codes
│   ├── settlement.ts    # Clearing window, cycle dates
│   ├── loan-contract.ts # Backend-verified protocol strings + depositData
│   ├── wallet-errors.ts # User-rejection / gas-revert predicates
│   └── au-minimum.ts    # AU cumulative-lending minimum (numeric half)
├── flows/               # Headless money-path state machines — ports in, codes out
│   ├── deposit-flow.ts  # The KYC-gated deposit pipeline
│   ├── withdraw-flow.ts # The withdrawal pipeline
│   ├── flow.ts          # Flow<S, I>: the run lifecycle both share
│   └── observable.ts    # FlowStore: subscribe, patch, abandon a run
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
| `src/flows/deposit-flow.ts`                | `DepositFlow` — the deposit pipeline, headless      |
| `src/flows/withdraw-flow.ts`               | `WithdrawFlow` — the withdrawal pipeline            |
| `src/flows/flow.ts`                        | `Flow<S, I>` — the run lifecycle both flows share   |

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

### `directusUrl` is genuinely optional

Pools, tranches, positions and request history come from the subgraph and the
chain; only CMS content needs Directus. Omitting `directusUrl` (or passing
`''`) therefore builds a working SDK: `getPoolOverview` returns on-chain data
with empty descriptions and images, and `getUserRequests` falls back to the raw
subgraph pool names. A call that exists ONLY to read CMS content —
`getPlatformOverview`, `getRiskManagement`, `getRepayments`, … — rejects with
the exported `NO_DIRECTUS_URL_MESSAGE`. Both services build the client through
`createDirectusClient` (`src/services/DataService/directus-client.ts`); never
call `createDirectus` directly, because `createDirectus('')` throws
`Invalid URL` from inside the constructor.

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
   language are.

   Exactly two kinds of string are exempt. `getTrancheDisplayName` (below) is
   here precisely so it CANNOT drift. And `loan-contract.ts` builds **protocol
   strings** — see below.
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
| `requests.ts`             | Lending-request view model as codes: status, kind, amounts, bundle, cycle         |
| `settlement.ts`           | Clearing-window phase and boundary, cycle close/outcome dates                     |
| `loan-contract.ts`        | `depositData` bytes, the signed-message builders, the contract payload types      |
| `wallet-errors.ts`        | `isUserRejected`, `isUnpredictableGas`, `classifyWalletFailure`                   |
| `au-minimum.ts`           | AU cumulative-lending minimum — thresholds, minor-unit maths, exemption test      |

`requests.ts` publishes the reallocation destination as a RAW tranche name
(`reallocationTargetTrancheName`), like `trancheName` — rename both at the view
boundary, never before.

### Protocol strings are the exception to "never copy"

`loan-contract.ts` returns strings a user never chooses to read: the message a
lender's wallet signs, and the two legacy templates kasu-backend still accepts.
The backend reconstructs each one **byte-for-byte** and verifies the signature
against it. A reworded line, a different separator or another date format does
not read differently — it stops every signature verifying, in production, for
every app at once. `encodeDepositData` is the same rule in bytes: its output
goes on chain, and kasu-ui (viem) and kasu-mobile (ethers) must produce
identical blobs, which the SDK test pins against viem-generated fixtures.

So these live in `domain/` for the same reason `getTrancheDisplayName` does —
not because they are copy, but because nothing may be allowed to drift. Any
change to one is a coordinated change with kasu-backend, landing in both repos
at once. They are never translated and never tidied.

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

## Flows

`src/flows/` is the domain layer one level up: a rule that unfolds over TIME.
`DepositFlow` and `WithdrawFlow` own the order of a deposit and a withdrawal,
the guards around them, and the codes that describe where a run got to. They
own no UI, no framework, no network and no words.

Before 2.7.0 each application drove its own copy of the deposit pipeline —
kasu-ui's `use-deposit-submit.ts` (786 lines) and kasu-mobile's
`use-deposit.ts` (a port of it) — and the copies had started to differ. It is
the money path, so one of them being subtly wrong was not a hypothetical cost.

**Three rules govern this layer.**

1. **No I/O of its own.** Every side effect is an injected port. The flow never
   learns a URL, a key or a wallet.
2. **No copy.** Every observable state is a code. `{ step: 'approve', reason:
   'cancelled' }`, never "USDC approval was cancelled in your wallet". Each app
   keeps its own `DEPOSIT_STEP_ERRORS` table and maps the codes to its words,
   in its design system and its language.
3. **No framework.** A `subscribe` callback and a plain `state` getter. React,
   Svelte, or a script in Node — the flow does not know.

### The deposit pipeline

| Phase              | Step       | What is happening                            |
| ------------------ | ---------- | -------------------------------------------- |
| `idle`             | —          | Nothing started, or `reset()` was called     |
| `generating-sign`  | `generate` | Lender signs the auth message                |
| `generating-fetch` | `generate` | `POST /contract/generate`                    |
| `awaiting-accept`  | `confirm`  | Agreement on screen; the run is PARKED       |
| `accepting-sign`   | `confirm`  | Lender signs the agreement                   |
| `approve`          | `approve`  | Exact-amount ERC-20 approve, and its receipt |
| `request-sign`     | `request`  | KYC signature, then the deposit call         |
| `request-confirm`  | `request`  | Waiting for the receipt                      |
| `success`          | `request`  | Terminal                                     |
| `declined`         | `confirm`  | Terminal — the lender backed out             |
| `error`            | (failing)  | Terminal — read `state.failure`              |

The order is reproduced from the web pipeline, and each position is
load-bearing:

- **The allowance pre-check runs FIRST**, before anything is signed, because it
  decides `approvalRequired` and therefore `stepTotal`. A badge that said "3 of
  4" and then silently became "3 of 3" would be describing a pipeline the
  lender is not in. It reads LIVE, never a cache: an exact-amount approval is
  fully consumed by the deposit it paid for, so a stale allowance is exactly
  the value that wrongly skips the approve and reverts the deposit. A FAILED
  read assumes an approve is needed — the cost is a redundant approval, the
  alternative is a reverted deposit.
- **The approve is for the EXACT amount, never `MaxUint256`** (house rule). An
  unlimited allowance outlives the deposit it was granted for, and a later
  exploit of the spender would drain a wallet that stopped lending months ago.
  A spec asserts the approved amount equals the deposit amount and is not
  `MaxUint256`.
- **The 5-minute TTL guard is checked AFTER the accept**, because that is where
  the idling happens — the lender has just spent as long as they wanted
  reading. An expired agreement fails with `contract-expired` instead of being
  broadcast as a transaction that cannot succeed.

### Failure codes

```ts
type DepositFailure =
    | { step: DepositStep; reason: 'cancelled' }
    | { step: DepositStep; reason: 'failed'; error: unknown }
    | { step: 'request'; reason: 'insufficient-balance'; error: unknown }
    | { step: 'request'; reason: 'contract-expired' };
```

`cancelled` is `isUserRejected` — the lender changed their mind, and telling
them something broke would be a lie. `insufficient-balance` is
`isUnpredictableGas` on the request step, which is almost always `transferFrom`
reverting on a balance that cannot cover the deposit; it takes precedence,
because nothing was refused and a retry would only reproduce it. Everything
else is `failed` and carries the original error for a crash reporter.

A backend failure is NEVER reported as a cancellation — not on `generate`, and
not on the KYC ports of the request step or the withdraw pre-check. The
lender's wallet was not involved in an HTTP call, so a backend that happens to
echo "user rejected" or word a refusal "declined" must not be shown to them as
something they did, and the error must survive for the crash reporter, which a
`cancelled` discards. `classifyWalletFailure` is for WALLET throws only.

`isUserRejected` reads the text for a SUBJECT, not for a keyword, for the same
reason: "declined" and "request rejected" are also what a rate limiter, a risk
engine and a KYC decision say, and ethers hands those over in the very envelope
a wallet error arrives in (`SERVER_ERROR` around `-32603`, the upstream body on
a nested `error.message`). A rejection is a wallet CODE — `4001`,
`ACTION_REJECTED` — or a sentence naming who did it: "user rejected", "declined
by the user", "cancelled by the wallet".

### Ports

| Port               | Default                        | Who owns it                    |
| ------------------ | ------------------------------ | ------------------------------ |
| `signMessage`      | none                           | The app's wallet               |
| `generateContract` | none                           | The app's proxy or the service |
| `getKycSignature`  | none                           | The app's own backend          |
| `buildKycParams`   | `kasu.deposits.buildKycParams` | SDK                            |
| `readAllowance`    | ERC-20 `allowance`             | SDK                            |
| `approve`          | ERC-20 `approve`               | SDK                            |
| `deposit`          | `kasu.deposits.deposit`        | SDK                            |
| `now`              | `Date.now`                     | SDK (injected for tests)       |

The three with no default all reach the application's own backend or wallet.
They will never gain one: this is a public package, and a URL or a key does not
belong in it.

Each default is applied PER KEY with `??`, never by spreading the overrides
over them. `{ ...defaults, ...ports }` lets an explicitly `undefined` value
delete the default it was meant to keep, and
`approve: sponsoredGasOn ? sponsoredApprove : undefined` is exactly how a
consumer writes a conditional override — kasu-ui writes precisely that. The
symptom was `ports.approve is not a function`, and, more quietly,
`readAllowance: undefined` forcing an approval on every run.

`spender` is NOT an input the consumer supplies. `kasu.flows.deposit()`
defaults it to this chain's `LendingPoolManager` — the only contract the
default deposit port calls — and `DepositFlowInput.spender` overrides it only
for a consumer that replaced the `deposit` port. A wrong spender leaves an
approval granted to the wrong contract and then reverts, diagnosed as
`insufficient-balance`.

`WithdrawPorts` mirrors the pair: `buildKycParams` (SDK default) plus
`getKycSignature` (no default). Supplying `getKycSignature` is what turns the
withdraw KYC pre-check on — it is the check kasu-mobile hand-wrote, and it is
now the same two ports on both money paths. `withdraw` and `withdrawMax`
default to `kasu.deposits`.

### Driving one

```ts
const flow = kasu.connect(signer).flows.deposit({
    signMessage: (message) => signer.signMessage(message),
    generateContract: (req) => postToMyProxy(req),
    getKycSignature: (params) => postToMyBackend(params),
});

const stop = flow.subscribe((state) => render(state)); // every transition
await flow.start({
    poolId,
    trancheId,
    amount, // BASE units, BigNumber
    fixedTermConfigId: '0',
    userAddress,
    depositAmount: 1000, // display units, for the backend's integrity check
    contractMessage: {
        format: 'loan-agreement',
        strategyName,
        region,
        optionName,
        amountLabel, // built from the SAME value as depositAmount
    },
});
// …the run parks on `awaiting-accept`; the UI shows `flow.state.contract`
await flow.acceptContract(); // or flow.declineContract()
```

`reset()` is safe mid-flight AND immediate: it abandons the run, drops its
remaining transitions, unparks a waiting handshake, and releases the re-entry
guard in the SAME tick, so `flow.reset(); flow.start(next)` is accepted even
while the abandoned run is still parked on a wallet prompt that never answers.
The abandoned run's late results are dropped by its run token, so it can never
drive a view the consumer has left back to `success`. `start()` is otherwise
guarded against re-entry — a double tap cannot fire two deposits.

The guard and the accept flag both belong to a RUN, not to the flow. They live
in `Flow<S, I>` (`flows/flow.ts`) with `state`, `isRunning`, `subscribe` and
`reset`, which both pipelines share rather than each keeping its own copy —
`WithdrawFlow` carried a line-for-line duplicate of all of it until 2.7.0, and
one guard living in two places is one guard that can be wrong in one of them.

`WithdrawFlow` is the same shape and much smaller: an optional KYC pre-check
(`buildKycParams` + `getKycSignature`, the deposit flow's own pair), then
`withdraw` or `withdrawMax`, with the same `cancelled` / `failed` split.
`'max'` is a CODE the consumer passes, not a balance it read: it routes to the
all-shares call, which resolves the balance on chain.

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

The Plume subgraph is indexed on a LEGACY Goldsky project, not the one the live
chains use — the same path under the current project returns 404, and the
legacy URL carries a `/gn` suffix the current ones do not.
`CHAIN_CONFIGS.plume.subgraphUrl` points at the legacy project (fixed in 2.6.0;
before that it 404'd). It is history-only, so nothing reads it in normal
operation.

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
npm run test:unit           # Every offline suite — this is what CI runs
npx jest src/domain         # Domain layer — pure, no network, fast
npx jest src/facade         # Chain config, read-only create, connect, facades
npm run test:live           # Opt-in, networked: LIVE_TESTS=1 jest src/tests
npm test                    # Everything; the live specs skip without LIVE_TESTS
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report
```

Tests use Jest and live beside the code they cover. The one exception is
`src/tests/`, which holds the specs that reach real subgraphs and RPCs: they are
OPT-IN, skipped unless `LIVE_TESTS=1`, so a network problem can never fail a
pull request that did not touch the network. A new spec goes beside its code,
not in `src/tests/`, unless it genuinely needs a live network.

Nothing in this repository may carry a private key, not even a throwaway — it is
a public repository. A spec that needs a signer generates one:
`ethers.Wallet.createRandom().connect(provider)`.

Nor may a fixture be a REAL address. A wallet that exists — a deployment
wallet, a lender, anything on an operational list — is not a test fixture, and
`src` ships in the tarball. Use an obviously synthetic one
(`0xAbCdEf0000000000000000000000000000000001`, `0x1111…`), mixed-case where the
spec is about casing.

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
npm run test:unit    # Offline test suites

# Publish:
npm version patch|minor|major
npm publish
```

`files` in `package.json` limits the tarball to `dist`, `src`, `abis`, the
README and the LICENSE, MINUS every test file (`!src/**/*.test.ts`,
`!src/tests`, and their `dist` counterparts). `src` MUST stay published: a
consumer deep-imports `@kasufinance/kasu-sdk/src/contracts` — which is exactly
why the specs must not ride along. They are dead weight in every consumer's
`node_modules`, and their fixtures are the kind of thing that ends up
published by accident. Check with `npm pack --dry-run` after any change to
`files`.

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
