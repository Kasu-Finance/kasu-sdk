# Kasu SDK

[![npm version](https://img.shields.io/npm/v/@kasufinance/kasu-sdk.svg)](https://www.npmjs.com/package/@kasufinance/kasu-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/Kasu-Finance/kasu-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Kasu-Finance/kasu-sdk/actions/workflows/ci.yml)

`@kasufinance/kasu-sdk` is the TypeScript SDK for the Kasu Finance protocol —
real-world credit funded on-chain. It wraps the core contracts, the subgraphs
and the CMS behind one object, so an application can list lending strategies,
read a lender's positions and submit KYC-gated deposits and withdrawals without
re-implementing the plumbing. It also ships a pure domain layer — the rate,
tranche and pool rules every Kasu frontend agrees on, as numbers rather than
copy — and headless deposit and withdrawal flows that own the ORDER of those
transactions so no application has to.

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
URLs, the stable asset, public RPC defaults and the block explorer:

```ts
import { CHAIN_CONFIGS, explorerTxUrl } from '@kasufinance/kasu-sdk';

CHAIN_CONFIGS.base.stableAsset; // { address, symbol, name, decimals, currencyCode }
CHAIN_CONFIGS.xdc.rpcUrls; // starting preference only — override with your own
explorerTxUrl(CHAIN_CONFIGS.base, txHash); // https://basescan.org/tx/0x… — throws on a malformed hash
```

You can also pass a whole `ChainConfigEntry` instead of a chain key.

## Facade API overview

| Facade            | Methods                                                                                                                 | Purpose                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `kasu.strategies` | `getAll()`, `getVisible()`, `getById()`, `getPlatformStats()`, `getPerformanceFeePercent()`, `calculateDepositLimits()`, `getRiskPerformance(poolId)`, `getOriginator(poolId)`, `getPoolTvlHistory(poolId)`, `getPoolTvlHistoryWindow(poolId)` | Browse pools, APY, capacity, risk, originator, TVL history |
| `kasu.deposits`   | `deposit()`, `withdraw()`, `withdrawMax()`, `buildKycParams()`, `isClearingPending()`                                   | Submit transactions             |
| `kasu.portfolio`  | `getPositions()`, `getYieldHistory()`, `getTransactionHistory()`, `getRequestStates()`                                  | Lender balances, yield, per-cycle earnings (net, in the chain's own stable token), history |
| `kasu.flows`      | `deposit(ports)`, `withdraw(ports?)`                                                                                    | Headless transaction pipelines  |
| `kasu.calls`      | `requestWithdrawal(params)`, `cancelDepositRequest(poolId, dNftId)`, `cancelWithdrawalRequest(poolId, wNftId)`, `withdrawAtExpiry(poolId, lockId)` | Encoded calls for a sponsored relay (read, then encode — never sends) |

On the instance itself: `kasu.connect(signer)`, `kasu.isReadOnly`,
`kasu.provider`, `kasu.chainConfig`, `kasu.isLiteDeployment`, and
`kasu.services` for the low-level services below.

`fetchUnusedPoolIds(directusUrl?)` reads the pool ids that are configured but
not yet published, for `configOverrides.UNUSED_LENDING_POOL_IDS`. It may
return an empty list; pass it straight through. `SdkConfig` normalises an empty
exclusion list to `['']`, because the subgraph reads `id_not_in: []` as "match
nothing" and would otherwise hide every pool.

`kasu.portfolio.getYieldHistory(user, { fromEpoch?, count? })` returns one
`{ epochId, epochEnd, poolId, trancheId, netYield }` per settled cycle the
lender held shares in; `aggregateYieldHistory(entries, { poolId? })` turns it
into chart bars. `netYield` is NET of the performance fee and in the
deployment's own stable token (AUDD on XDC AUDD — convert before showing USD);
`epochEnd` is unix seconds. For a fixed-term lock holder the bars can sum to
slightly more than lifetime interest (up to about 0.2 %, top-ups are valued at
today's share price), so show "earned to date" from the lifetime figure, not
from the sum of the bars.

`kasu.strategies.getPoolTvlHistory(poolId, { fromEpoch?, count?, timeoutMs?,
signal? })` returns the strategy's TVL (total lent by everyone) as
`{ epochId, timestamp, tvl, kind }[]`, ascending in time: one
`kind: 'clearing'` point per finished clearing, read at the block it finished
in, then one `kind: 'current'` point. `tvl` is in the deployment's own stable
token (AUDD on XDC AUDD — convert before showing USD) and is on-chain plus
off-chain TVL, the same `poolTvl` sum `tvl.total` uses; `timestamp` is unix
seconds. Plot by `timestamp`, not `epochId`: epoch numbers can jump, and
clearings run in one block share a point in time.

The `current` point is the subgraph's latest balance plus the off-chain TVL
read at `latest`, so it equals `strategy.tvl.total` when both calls' reads
succeed. `tvl.total` falls back to an off-chain 0 when its own read fails;
the history throws instead.

The off-chain part at old blocks needs RPCs that serve PAST state (archive
nodes). Built-in chains carry public ones (`historyRpcUrls`, tried in order,
10 s per call), but they are RATE-LIMITED and shared: **partners should pass
their own archive provider** — `Kasu.create({ chain, historyProvider })` — or
their own `configOverrides.historyRpcUrls`. A failed past-state read throws
(after retries); it never becomes 0. Final blocks are cached per SDK
instance, so a second call reads only what is new. `timeoutMs` (default
30 s) and `signal` bound the call and reject with
`PoolTvlHistoryTimeoutError` / `PoolTvlHistoryAbortedError`.

A strategy can run on more than one deployment (Tax Pay lends on Base and on
XDC AUDD), and its total lent is the sum of its pools. `strategyDeployments`
names the pools and `combineTvlHistories` adds their histories in USD at the
rates you pass. The SDK fetches no exchange rate:

```ts
import { CHAIN_CONFIGS, combineTvlHistories, strategyDeployments } from '@kasufinance/kasu-sdk';

// Your rates, keyed by ISO-4217 code — never a guess. No rate, no total.
const usdPer: Record<string, number> = { USD: 1, AUD: audToUsd };

const legs = strategyDeployments(strategy.id, 'base');
// [{ chain: 'base', poolId: '0x…' }, { chain: 'xdc', poolId: '0x…' }]

const histories = await Promise.all(
    legs.map(async ({ chain, poolId }) => ({
        // { entries, opening } — `opening`: what the pool held just before the window
        ...(await sdks[chain].strategies.getPoolTvlHistoryWindow(poolId, { count: 52 })),
        usdRate: usdPer[CHAIN_CONFIGS[chain].stableAsset.currencyCode],
    })),
);
const points = combineTvlHistories(histories); // { timestamp, tvlUsd, kind }[]
```

`strategyDeployments(poolId, chain)` takes the deployment the id was read on
(required: an address alone does not name its chain) and returns the same set
from either side of the mapping; an unmapped id is a strategy of one on its
own chain, and an id the mapping places on another deployment throws
`StrategyDeploymentInputError`. `combineTvlHistories` is a step merge by time:
at every clearing on any leg, each leg's latest point, times its rate, summed;
a leg's `opening` (the clearing just before its window, read like every
other point) is one more step, from its own time until the first entry, and
a pool that started inside the window has none and counts 0 until then, so
windows cut at different times on each chain draw no false step. It ends with one `current` point, the sum of
the legs' current values. A missing rate, an empty leg or a bad entry throws
`TvlHistoryInputError`, so the series never holds `NaN` and never passes off
one chain's figure as the total.

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
| Partners             | `getCreditOriginator`, `getInstitutionalLender`, `getStrategyRegion`, `APXIUM`, `INVOICEMATE`, `RIXON_CAPITAL` (each with a `region`)                                                                  |
| Fixed term           | `availableFixedTermConfigs`, `isFixedTermConfigId`, `lockDurationDays`, `lockDurationMonths`, `DAYS_PER_EPOCH`, `DAYS_PER_MONTH`, `MIN_DAYS_FOR_MONTHS`                                               |
| Yields               | `weeklyInterest`, `dailyInterest`, `accruedInterest`, `projectedAnnualEarnings`, `weightedAverageApy`, `SECONDS_PER_WEEK` — NET of the performance fee                                               |
| Batch proof          | `validateDepositBatchCalls`, `proveDepositInReceipt`, `DepositBatchMismatchError`, `ENTRY_POINT_V07`                                                                                                   |
| Tranche display name | `getTrancheDisplayName`, `UPPER_MEZZANINE`                                                                                                                                                               |
| Strategy summary     | `pickShortDescription` — the CMS short blurb as one line of plain text, or `undefined` (also on every `Strategy` as `summary`)                                                                            |
| Requests             | `deriveRequestState`, `submissionEvents`, `countSubmissions`, `firstSubmissionTimestamp`, `isCycleClosed`                                                                                                |
| Settlement           | `computeSettlementWindow`, `nextCycleBoundary`, `deriveCycleDates`, `CLEARING_WINDOW_SECONDS`                                                                                                            |
| Loan contract        | `encodeDepositData`, `buildContractVersionType`, `buildLoanAgreementSignMessage`, `buildLegacyContractRequestMessage`, `buildFullNameRequestMessage`, `formatSignTimestampUtc`, `parseFormattedMessage`, `asContractType` |
| Wallet errors        | `isUserRejected`, `isUnpredictableGas`, `classifyWalletFailure`                                                                                                                                          |
| Pool TVL             | `poolTvl`, `combineTvlHistories`, `TvlHistoryInputError` — one strategy's history summed across deployments, in USD at the caller's rates |
| Revert errors        | `decodeRevert`, `extractRevertData` — the bytes a reverted call came back with, read as the custom error the contract named                                                                              |
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
- **`Strategy.summary` is CMS editorial, cleaned, never authored.** It is
  `liteDescription` when usable, else the first paragraph of `description`,
  with inline markdown markers stripped and whitespace collapsed to one line.
  The `"Not Available"` placeholder and a blank value count as missing, and an
  absent blurb is `undefined`: what to show instead is the app's decision.
  `liteDescription` and `description` stay the raw CMS values. It is NOT
  sanitised: HTML tags and link syntax pass through unchanged, so render it
  as text, never as HTML or markdown.
- **The tranche rename is display-only.** `getTrancheDisplayName` maps the
  `Senior` tranche to "Upper Mezzanine" on Apxium strategies, because the true
  senior position is held by an institutional lender. Call it at the view
  boundary only: ranking, matching and sorting keep the raw on-chain name —
  which is why `deriveRequestState` returns `trancheName` raw — and
  `reallocationTargetTrancheName` with it.

## Flows

`DepositFlow` and `WithdrawFlow` are the domain layer one level up: a rule that
unfolds over TIME. They own the order of a deposit and a withdrawal, the guards
around them, and the codes that describe where a run got to. They own no UI, no
framework, no network and **no copy** — every observable state is a code, and
your application maps it to its own words in its own language.

Every side effect is an injected port, so the SDK never learns a URL, a key or
a wallet. `kasu.flows.deposit()` fills the ports it can from this instance; the
three that reach your own backend or wallet you always supply.

```ts
import { Kasu } from '@kasufinance/kasu-sdk';
import { parseUnits } from 'ethers/lib/utils';

const kasu = Kasu.create({ chain: 'base' }).connect(signer);

const flow = kasu.flows.deposit({
    signMessage: (message) => signer.signMessage(message),
    generateContract: (req) => postJson('/api/agreements/generate', req),
    getKycSignature: (params) => postJson('/api/kyc-signature', params),
    // readAllowance, approve, deposit and buildKycParams default to the SDK's
    // own signer-bound implementations — override any of them if you need to.
});

const stop = flow.subscribe((state) => {
    // Every transition. `state.phase`, `state.step`, `state.stepIndex`,
    // `state.stepTotal`, `state.contract`, `state.failure` — all codes.
    render(state);
});

await flow.start({
    poolId,
    trancheId,
    amount: parseUnits('1000', 6), // BASE units
    fixedTermConfigId: '0', // '0' = variable rate
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

// The run PARKS on `awaiting-accept` with the agreement in `state.contract`.
// Show it, then settle the handshake:
await flow.acceptContract(); // signs it and carries on
// or: flow.declineContract();  → phase 'declined', nothing submitted
```

### One atomic transaction: the `depositBatch` port

If your application can submit several calls as ONE atomic transaction (all
apply or none does), supply the optional `depositBatch` port. When the
allowance is short, the run then approves and deposits in a single batch
instead of two transactions. You decide how the batch is sent; the SDK decides
what is in it:

```ts
import { BatchRevertedError, type BatchCall } from '@kasufinance/kasu-sdk';

const flow = kasu.flows.deposit({
    signMessage,
    generateContract,
    getKycSignature,
    depositBatch: async (calls: BatchCall[]) => {
        // calls[0]: stableAsset.approve(LendingPoolManager, amount) — EXACT amount
        // calls[1]: LendingPoolManager.requestDepositWithKyc(…) — value 0
        const tx = await submitAtomically(calls); // your mechanism
        return tx; // anything with wait()
        // Known to revert? throw new BatchRevertedError('ClearingIsPending')
    },
});

// …after acceptContract(), a batched run parks on `awaiting-authorise`:
flow.authoriseTransfer(); // the lender's explicit go-ahead
// or: flow.declineTransfer(); → error { step: 'request', reason: 'cancelled' }
```

- The batch path is taken only when the allowance is short, the port is
  supplied and the chain's stable token is known (`kasu.flows.deposit()` fills
  it from the chain config). Otherwise the run is exactly the two-transaction
  pipeline.
- A batch has no wallet prompt per call, so the run **parks for an explicit
  authorisation** before any money moves. The agreement's TTL is checked again
  after it, and the KYC signature is fetched only then.
- `state.batched` is `true` from the first state of a batched run. It never
  enters `approve`, so it counts as a three-step run (`stepTotal` 3).
- Throw `BatchRevertedError(revertError)` when the batch is known to revert →
  `{ step: 'request', reason: 'reverted', revertError }`. Throw a
  `BatchSubmissionError` (or `BatchPendingError`) to report a submission
  outcome: `pending` → `{ reason: 'pending' }`, `already-submitted` →
  `{ reason: 'already-submitted' }`, `failed` → `{ reason: 'failed' }` — read
  at its word, never through the revert decoder. Any other throw is read like a
  direct deposit's: a wallet rejection is `cancelled`, everything else
  `failed`.

### Submitting a sponsored batch: `submitBatch` (2.9.0)

For a submitter that relays the batch and is asked for its status later (a
sponsored-gas relay, for one), `submitBatch` owns the polling policy, the
receipt proof and the outcome taxonomy. Your ports do the I/O; the SDK decides
what each answer means:

```ts
import {
    submitBatch,
    validateDepositBatchCalls,
} from '@kasufinance/kasu-sdk';

depositBatch: (calls) => {
    // Before signing: the batch is exactly this run's deposit, or it throws.
    const { tranche, amount } = validateDepositBatchCalls(calls, {
        stableAsset, spender, poolId, trancheId, amount, fixedTermConfigId,
    });
    return submitBatch(
        // `pendingPool` is the strategy's pending pool (`ILendingPool.pendingPool()`):
        // with it, only THAT contract's `DepositRequested` can prove the deposit.
        { calls, expect: { lender, tranche, amount, pendingPool } },
        {
            post: (calls) => postToMyRelay(calls), // → { transactionId }
            getStatus: (id) => readMyRelayStatus(id), // normalised BatchStatusRead
            getReceipt: (hash) => provider.waitForTransaction(hash, 1, 120_000),
            now: Date.now,
            sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
        },
    );
},
```

- **An ambiguous result is never reported as failed.** Once the batch has been
  posted only a revert proves nothing was deposited; a timeout, an unreadable
  receipt, an unknown status or an unrecognised `post` error is a
  `BatchPendingError`, and the run ends `{ reason: 'pending' }`. Tell the
  lender it may still be processing — never "try again".
- `wait()` resolves only when `proveDepositInReceipt` finds THIS lender's
  `DepositRequested` for the expected tranche AND amount inside their own user
  operation — and, when `pendingPool` is given, emitted by that contract. A
  handleOps receipt's `status` decides nothing.
- Polling: first read at once, then 3 s ×1.5 to a 10 s ceiling, for 10 minutes
  (`DEFAULT_BATCH_POLLING_POLICY`; pass a partial policy to override).
- `checkBatchOutcome(transactionId, expect, ports)` is the one-read check for an
  app's guard against lending twice after a `pending` run.

**Phases** — `idle`, `generating-sign`, `generating-fetch`, `awaiting-accept`,
`accepting-sign`, `approve`, `awaiting-authorise` (batch path only),
`request-sign`, `request-confirm`, and the
terminal `success` / `declined` / `error`. Each maps to one of four steps
(`generate`, `confirm`, `approve`, `request`); `stepIndex` and `stepTotal` are
published because the approve step drops out of the sequence when the allowance
already covers the deposit, and a badge total that changed under a lender would
be describing a pipeline they are not in.

**Failures** are codes, never sentences:

```ts
type DepositFailure =
    | { step: DepositStep; reason: 'cancelled' } // isUserRejected
    | { step: DepositStep; reason: 'failed'; error: unknown }
    | { step: 'request'; reason: 'insufficient-balance'; error: unknown }
    | {
          step: 'request';
          reason: 'reverted';
          revertError: string; // e.g. 'ClearingIsPending'
          error: unknown;
      }
    | { step: 'request'; reason: 'contract-expired' } // the 5-minute TTL
    | {
          step: 'request';
          reason: 'pending' | 'already-submitted'; // batch path only — NOT failures
          error: unknown;
      };
```

A wallet rejection is `cancelled`, not a failure: the lender changed their
mind, and telling them something broke would be a lie. Everything else is
`failed` and carries the original error for your crash reporter.

A revert on the request step is read for WHAT reverted. `requestDepositWithKyc`
reverts for a family of reasons the ABI declares — `LendingPoolIsStopped`,
`ClearingIsPending`, `InvalidTranche`, `UserNotKycd`, `UserBlocked`,
`UserNotInAllowList`, `BlockExpired` — and none of them is a shortfall. Those
come back as `reverted`, with `revertError` naming the contract error. Only a
token balance or allowance failure, or revert data nothing can decode, is
`insufficient-balance`.

**Render `reverted` with generic copy and special-case only the names you have
words for.** A contract upgrade can add an error, so treat the set as open: a
consumer that assumed it was closed has nothing to show for a new one.
`decodeRevert(err)` is exported if you want the same reading elsewhere.

```ts
if (failure.reason === 'reverted') {
    switch (failure.revertError) {
        case 'ClearingIsPending':
            return t('deposit.error.clearing');
        case 'UserNotKycd':
            return t('deposit.error.kyc');
        default:
            return t('deposit.error.rejectedOnChain'); // generic
    }
}
```

**Both personal signs are length-checked where they are taken.** A wallet is
not obliged to return 65 bytes and the ABI coder will not catch one that does
not — `0x` encodes into `depositData` as happily as a real signature does, and
the agreements service could then never verify the deposit. A malformed auth
signature fails the `generate` step and a malformed acceptance signature fails
`confirm`, both as `failed`, before anything is broadcast.

Three guarantees worth knowing:

- **The approve is for the EXACT amount, never unlimited.** An unlimited
  allowance outlives the deposit it was granted for; a later exploit of the
  spender would drain a wallet that stopped lending months ago.
- **The allowance is read live, before anything is signed.** An exact-amount
  approval is fully consumed by the deposit it paid for, so a cached allowance
  is exactly the value that wrongly skips the approve and reverts the deposit.
- **The spender is the SDK's, not yours.** `kasu.flows.deposit()` defaults it
  to this chain's `LendingPoolManager` — the only contract the default deposit
  port calls — so you no longer pass it. `spender` on the input still
  overrides, for a consumer that replaced the `deposit` port; a wrong one is an
  approval granted to the wrong contract and then a revert you would read as
  `insufficient-balance`.
- **`reset()` is safe mid-flight, and immediate.** It abandons the run, drops
  its remaining transitions, unparks a waiting handshake and releases the
  re-entry guard in the SAME tick — so `flow.reset(); flow.start(next)` starts
  the next run even when the abandoned one is still parked on a wallet prompt
  that will never answer. An abandoned run can never drive a view you have left
  back to `success`. `start()` is otherwise guarded against re-entry, so a
  double tap cannot fire two deposits.
- **Only wallet errors can be `cancelled`.** The ports that reach your backend
  — `generateContract`, `buildKycParams`, `getKycSignature` — always fail as
  `failed`, with the error kept. A backend that words a refusal "declined" is
  never reported to a lender as something they did in their wallet.

`WithdrawFlow` is the same shape and much smaller — an optional KYC pre-check,
then `withdraw` or `withdrawMax`, with the same `cancelled` / `failed` split:

```ts
const flow = kasu.flows.withdraw();
await flow.start({ poolId, trancheId, amount: 'max', userAddress });

// With the pre-check: supply `getKycSignature` and the run checks the lender's
// KYC before opening the wallet, on a `checking-kyc` phase and a `kyc` step.
// `buildKycParams` defaults to the SDK's, exactly as on the deposit path.
const checked = kasu.flows.withdraw({
    getKycSignature: (params) => postJson('/api/kyc-signature', params),
});
```

`'max'` is a code you pass, not a balance you read: it routes to the all-shares
request, whose share count the SDK reads (`balanceOf`) at submission instead of
converting an asset figure — so no dust is stranded.

### Sponsored withdraw and cancel (2.10.0)

`kasu.calls` encodes the single `LendingPoolManager` calls a gas-sponsoring
relay carries. Each returns `{ kind, call }`: post `kind` and `[call]` exactly
as given — the relay judges the call by its kind, so never map one yourself.

```ts
import { submitSponsoredCall } from '@kasufinance/kasu-sdk';

const ports = {
    post: ({ kind, call }) => postToMyRelay({ kind, calls: [call] }), // → { transactionId }
    getStatus: (id) => readMyRelayStatus(id), // normalised BatchStatusRead
    getReceipt: (hash) => provider.waitForTransaction(hash, 1, 120_000),
    now: Date.now,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
};

// Withdraw: the flow encodes the call (shares from convertToShares, or the
// whole balanceOf for 'max') and submits it through your port.
const flow = kasu.flows.withdraw({
    submitCall: (call) =>
        submitSponsoredCall({ call, expect: { sender: lender } }, ports),
});
flow.state.sponsored; // true, from the first state
await flow.start({ poolId, trancheId, amount: 'max', userAddress: lender });

// Cancel: encode, then submit the same way.
const cancel = kasu.calls.cancelDepositRequest(poolId, dNftId);
const submission = await submitSponsoredCall(
    { call: cancel, expect: { sender: lender } },
    ports,
);
await submission.wait(); // resolves only when the lender's operation executed
```

- `submitSponsoredCall` is `submitBatch` for one call: the same polling policy
  and outcome table, with `proveUserOperationInReceipt` as the proof — the
  lender's own operation, from the EntryPoint, with `success` set. A reverted
  operation is `BatchRevertedError`; anything unproven is `BatchPendingError`.
- On the sponsored path a withdrawal's failure can also be `{ reason:
  'reverted', revertError }` and `{ reason: 'pending' | 'already-submitted' }`.
  A wallet rejection thrown by `submitCall` (the lender declined to sign) is
  `cancelled`. Any other throw from `submitCall` or `wait()` the SDK does not
  recognise is `pending` — it may have left, so never tell the lender to try
  again. A throw while encoding (a share read, an empty position) is `failed`:
  nothing was sent.
- `cancelDeadline(requestState, nextEpochStart, nowSeconds)` is the "cancel
  until" instant for a pending request (the next cycle close), or `null`.

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

`npm ci` also installs a **pre-push hook** (`.githooks/pre-push`) that runs the
same steps locally before every `git push`: first a lockfile check
(`npm ci --dry-run`, which fails when `package.json` and `package-lock.json`
disagree), then `build-tc`, `build`, `test:unit` and `rollup-build`. It stops at
the first failing step and names it. It checks the working tree, not the pushed
commits, so commit first. `SKIP_PREPUSH=1 git push` skips it with a warning; CI
is still the gate.

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
