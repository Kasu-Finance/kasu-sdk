# Changelog

All notable changes to `@kasufinance/kasu-sdk`. Versions follow semantic
versioning; earlier releases are described in their commit messages.

## 2.13.1

Request amounts are now in the right unit, and the request view model reads
them for what they are. The subgraph holds a deposit request's
`amountRequested` in ASSETS and a withdrawal request's in tranche SHARES; only
the shares may be priced. Either way it is the amount still OUTSTANDING: each
accepted or rejected part is taken off it.

### Fixed

- **`UserLending.getUserRequests` — `requestedAmount` of a DEPOSIT request.**
  Deposit request amounts were overstated by the tranche share price: the
  asset amount was priced as if it were shares, so a pending 1,000 deposit in
  a tranche at 1.15 assets per share read 1,150. It is now the amount the
  lender asked for, top-ups included. Visible wherever a deposit is still
  outstanding (pending or partly processed); a settled deposit's figure is 0
  either way. The same correction reaches `RequestState.requestedAmount` and
  `RequestState.amount` for pending deposits (`deriveRequestState`,
  `kasu.portfolio.getTransactionHistory`). Withdrawal requests, accepted and
  rejected amounts and event amounts are unchanged — they were already in
  assets.
- **`UserLending.getCurrentEpochFtdAmount`.** Fixed-term deposit amounts for
  the current epoch were overstated by the tranche share price in the same
  way; they are now asset amounts. The query now reads deposit requests only,
  and the amounts for one tranche and fixed-term config are summed, so a
  cancelled request no longer overwrites its replacement with 0.
- **`UserLending.getCurrentFtdBalance`.** Locked fixed-term shares were
  priced at the pool's AVERAGE share price across its tranches; they are now
  priced at their own tranche's share price. The figure was understated for a
  tranche above the pool average and overstated for one below it. Its
  current-epoch sibling, `getCurrentEpochFtdAmount`, now leaves out a config
  whose total is 0 instead of returning the string `'0.0'`.
- **`deriveRequestState` — status of a partly paid withdrawal.**
  `requestedAmount` is what is still queued, not what was first asked for. A
  withdrawal with part paid and the rest still queued in an open cycle read
  `pending` whenever more had been paid than was left (1000 asked, 700 paid,
  300 queued); it now reads `partial`, whichever part is larger. A resolved
  withdrawal has nothing left queued, so it is always `complete`.
- **`deriveRequestState` — amount of a cancelled request with a top-up.** A
  cancelled request's `requestedAmount` was rebuilt from its first submission
  alone, so top-ups were missed (1000 plus a 500 top-up, cancelled, read
  1000). It now reads the amount on the cancellation itself — everything
  outstanding when it was cancelled — and falls back to the first submission
  only when that figure is missing.
- **Unknown request types fail closed.** `getUserRequests` throws for a
  request type it does not know (`UNKNOWN_REQUEST_TYPE_MESSAGE`) instead of
  pricing its amount as shares.

## 2.13.0

A strategy's TVL over time — the data behind a TVL chart — from the same
definition as the figure above it, so the chart's last point equals the
header whenever both reads succeed.

### Added

- **`kasu.strategies.getPoolTvlHistory(poolId, { fromEpoch?, count?,
  timeoutMs?, signal? })`** (and `DataService.getPoolTvlHistory`) →
  `PoolTvlHistoryEntry[]` `{ epochId, timestamp, tvl, kind }`, ascending in
  time.
  - One `kind: 'clearing'` point per finished clearing, read at the block
    it finished in (`LendingPoolClearing.endBlockNumber`), then ONE
    `kind: 'current'` point carrying the current epoch: the subgraph's
    latest balance plus `externalTVLOfPool` at `latest` on the history
    provider. It equals today's `totalValueLocked.total`
    (`strategy.tvl.total`) when both calls' reads succeed;
    `getPoolOverview` still falls back to an off-chain 0 when its own read
    fails (unchanged), the history throws.
  - `tvl` = on-chain `lendingPool.balance` (subgraph time-travel,
    `block: { number }`) + off-chain `ExternalTVL.externalTVLOfPool` at the
    same block. Units: display units of the deployment's OWN stable token
    (USDC on Base and XDC USDC, AUDD on XDC AUDD) — convert before
    formatting as USD.
  - `timestamp` is unix SECONDS: the block time the clearing finished; the
    subgraph's latest block for the `current` point.
  - Ordered by block, then epoch: plot by `timestamp`. Epoch numbers can
    jump (a pool that stopped clearing; XDC AUDD's first clearing is
    numbered 1, a week before epoch 88), and clearings that ran in one block
    share a timestamp and a `tvl`. A pool that has not cleared for a while
    ends at its last clearing, then the `current` point.
  - Window by epoch: `count` = the newest `count` epochs up to the current
    one (only the newest `count` clearings are read); `fromEpoch` = from
    that epoch on. A window that stops before the current epoch has no
    `current` point. A malformed option (`RangeError` / `TypeError`) or pool
    id (`TypeError`) throws before any network read.
  - `timeoutMs` (default 30 000 ms) and `signal` bound the whole call:
    `PoolTvlHistoryTimeoutError` / `PoolTvlHistoryAbortedError`, the
    subgraph requests are aborted and no new read starts.
  - The off-chain part is 0 before the `ExternalTVL` contract existed,
    decided by `getCode`, never by catching a revert — and only if the same
    provider shows the pool's own code at those blocks; a pruned provider
    is `PastStateUnavailableError`. Any other failed past-state read throws
    after three attempts over every history RPC.
  - Final blocks (64+ below the subgraph head) are cached per SDK instance,
    keyed by contract or subgraph, pool and block: a second call reads only
    the new clearings and the latest figure.
  - `[]` for a pool the subgraph does not know, and on a LITE deployment
    whose subgraph lacks the entities. On a full deployment that schema
    error throws, like every network, indexing or past-state failure.
  - Cost (uncached): one subgraph request for the clearings (per
    thousand), one per hundred distinct clearing blocks (three for a pool
    with ~120 epochs), a `currentEpochNumber` read, and on the history RPCs
    one `externalTVLOfPool` per distinct block plus the latest and one to
    about log2(n) `getCode` reads, at most eight in flight.
- **History RPCs** — the off-chain TVL at old blocks needs RPCs that serve
  PAST state; a pruned node refuses it (and ethers v5 reports the refusal
  as a "call exception"). `ChainConfigEntry.historyRpcUrls` (Base
  `mainnet.base.org`, `base.drpc.org`, `1rpc.io/base`; both XDC
  deployments `rpc.primenumbers.xyz`, `rpc.ankr.com/xdc`), tried in order
  with a 10 s per-call timeout; `SdkConfigOptions.historyRpcUrls` and
  `chainId`; `KasuOptions.historyProvider` (wins; kept across `connect`)
  and the optional third `KasuSdk` argument `{ historyProvider }`. The
  public defaults are rate-limited: partners should pass their own archive
  provider. Without any, `getPoolTvlHistory` throws
  `NO_HISTORY_PROVIDER_MESSAGE` on a deployment that has an `ExternalTVL`
  contract.
- **`poolTvl(onChain, offChain)`** (domain) — the one TVL definition;
  `getPoolOverview` now computes `totalValueLocked.total` with it.
- Errors: `PoolTvlHistoryTimeoutError`, `PoolTvlHistoryAbortedError`,
  `PastStateUnavailableError`.

### Changed

- `isMissingEntityError` / `isEmptyHistoryError` moved to
  `services/shared.ts` so both histories share the Lite-vs-full rule; they
  are still exported from `services/Portfolio/yield-history.ts`.

### Planned

- The remaining single-formula portfolio work, previously planned for
  2.13, moves to 2.14.

## 2.12.0

A lender's settled interest per cycle — the data behind an earnings chart —
from one per-epoch formula that the portfolio's last-cycle figures now share,
so a strategy's newest bar and its last-cycle figure cannot disagree.

### Added

- **`kasu.portfolio.getYieldHistory(userAddress, { fromEpoch?, count? })`**
  (and `Portfolio.getYieldHistory`) → `YieldHistoryEntry[]`, one per pool,
  tranche and settled epoch in which the lender held shares:
  `{ epochId, epochEnd, poolId, trancheId, netYield }`.
  - `netYield` is what the close credited the lender, AFTER the performance
    fee: the subgraph's `InterestApplied` amount is already net, so it is
    used as is. Units: display units of the deployment's OWN stable token
    (USDC on Base and XDC USDC, AUDD on XDC AUDD) — convert before
    formatting as USD. There is no gross: the subgraph keeps only today's
    fee, so a historical gross would be a guess.
  - `epochEnd` is unix SECONDS (the next epoch's start).
  - Only settled epochs (`< currentEpoch`); with no options, all of them;
    `count` alone = the newest `count`. A malformed option throws
    `RangeError` before any network read.
  - `[]` for a new lender, and on a LITE deployment whose subgraph lacks the
    entities. On a full deployment that schema error throws, like every
    network or indexing failure.
  - Cost: one positions request, then one request per 1 000-row page of the
    longest series (normally two subgraph round trips), plus three parallel
    `SystemVariables` reads.
  - A pool's `totalYieldEarningsLastEpoch` equals its bar for the epoch of
    its most recently APPLIED interest — older than the last cycle for a pool
    that has not cleared since. A lender who held nothing at that epoch has
    no bar there and a figure of 0.
  - For a fixed-term lock holder the bars can sum to slightly MORE than
    lifetime interest (up to about 0.2 %): each top-up is valued at today's
    tranche share price. Show "earned to date" from the lifetime figure,
    never from the sum of the bars.
- **`aggregateYieldHistory(entries, { poolId?, trancheId? })`** (domain) →
  one `{ epochId, epochEnd, netYield }` per epoch, ascending: all
  strategies, or one.
- **`epochTrancheYield(input)`** (domain) — the one per-epoch formula
  (share-weighted interest, the fixed-term locks' split and top-ups).

### Fixed

- `PortfolioLendingPool.totalYieldEarningsLastEpoch` is now THAT pool's
  figure. It was a running total over every pool before it in the list, and
  it counted a fixed-term lock's share of the base interest twice.
- A lock's last-epoch top-up no longer includes a top-up applied at a
  clearing that has run but whose epoch has not rolled over yet: it reads the
  lock's shares as of the last settled epoch (new `lockSharesAtLastEpoch`
  selection in `lendingPortfolioQuery`), never its current shares.
- A lock made after a clearing (its first share snapshot tagged one epoch
  after its start) no longer books its whole principal as a top-up: a
  missing snapshot reads the lock's `initialTrancheShares`.
- `lendingPortfolioQuery` sizes every nested list with `$first` (1 000, the
  same constant as the history), instead of the subgraph's default of 100.
- Last-epoch money strings go through `precisionToString`, which now prints
  anything below a millionth of a token as `'0'` (no `1e-7`, no tiny negative
  remainder). A zero share denominator gives `0`, not `NaN`.

One edge stays as it was. When a pool has no interest recorded for the last
settled epoch (a late or stopped clearing), the last-epoch figures show the
newest interest the tranche has, weighted by the share snapshots as of the
last settled epoch; the history dates that interest to its own epoch. The
two are equal unless the lender's or the tranche's shares changed after it.

## 2.11.0

A strategy's short blurb as one shared rule, so every app shows the same
line instead of each re-deriving it from the CMS fields. Additive only: no
field is renamed, removed or changed.

This release carries `summary` alone. The portfolio additions planned for
2.11 (typed portfolio read, `derivePositions`, per-pool latest clearing,
`positionSlices`, `pendingPoolAddress`, `batchOnly`) move to the next minor.

### Added

- **`Strategy.summary?: string`** — the strategy's short blurb as ONE line of
  plain text: `liteDescription` when it is usable, else the first paragraph
  of `description`. Inline markdown markers (`**`, `__`, `*`, `_`, backticks)
  are stripped and every run of whitespace becomes one space. The
  `"Not Available"` placeholder (the whole trimmed value, any case), an empty
  or blank value and a missing one all count as absent. `undefined` when
  neither field yields a blurb; the SDK never substitutes a sentence of its
  own. `liteDescription` and `description` keep their raw CMS values. It is
  not sanitised: HTML tags and link syntax pass through unchanged, so render
  it as text, never as HTML or markdown.
- **`pickShortDescription(source)`** (domain) — the pure function behind it,
  for consumers holding a raw `PoolOverview`. It takes any
  `{ liteDescription?, description? }` (`ShortDescriptionSource`) and reads a
  non-string field as missing.

Lifted from kasu-ui's function of the same name and pinned to its output for
every live CMS row on base, xdc and xdc-usdc. It differs only on inputs no
live row has: the cleaned text is trimmed (a CRLF paragraph no longer ends
in a space), and a value that is nothing but markdown markers counts as
missing, so the result is never a blank string.

## 2.10.3

Sponsored P2P transfer: the stable asset's own `transfer` as a sponsored-call
kind, so a relay client sends it through `submitSponsoredCall` like the
withdraw and cancel calls. Plus the strategy's CMS subheading and short
description as typed `Strategy` fields.

### Added

- **`'transfer'` in `SPONSORED_CALL_KINDS`**, with its selector
  (`0xa9059cbb`) in `SPONSORED_CALL_SELECTORS`, derived from the generated
  `IERC20Metadata` ABI and never typed in. `submitSponsoredCall` accepts a
  transfer call and proves it with `proveUserOperationInReceipt`, like every
  other single call.
- **`encodeStableTransfer({ stableAsset, to, amount })`** → `{ kind:
  'transfer', call: { to: stableAsset, data } }`. Pure. It refuses a malformed
  stable asset or recipient (a mixed-case recipient whose EIP-55 checksum does
  not match included), the zero address as the recipient, and an amount
  that is zero, negative, fractional or above uint256
  (`SponsoredCallInputError`: `stable-asset`, `recipient`, `zero-recipient`,
  `amount`, `zero-amount`). The recipient POLICY is not restated here: the
  sender's own account, the stable asset, the `LendingPoolManager`, the
  precompile range, an address with contract code, an unverified sender and
  the daily caps are all the relay's refusals.

- **`checkSponsoredCallOutcome(transactionId, { sender }, ports)`** —
  `checkBatchOutcome` for one sponsored call: ONE status read, no polling,
  answering `executed` (mined, and the receipt proves the sender's operation
  succeeded), `not-executed` (definitively reverted) or `unknown` (anything
  else, a failed read included). For an app's guard against submitting the
  same call twice after a run that ended pending — only `not-executed` may let
  a new attempt proceed unprompted.

- **`Strategy.subheading?: string` and `Strategy.liteDescription?: string`**
  — the CMS subheading and short description, until now reachable only on
  `_raw`. Mapped from the same `PoolOverview` fields `_raw` carries; an
  absent, empty or blank value is `undefined`, never `''` (the service maps a
  missing `liteDescription` to `''`).

### Changed

- `SponsoredCallKind` gains `'transfer'`. A consumer with an exhaustive
  `switch` over it must add a case.

### Fixed

- `checkBatchOutcome` (and the new `checkSponsoredCallOutcome`) answer
  `unknown` for a `mined` status read with an EMPTY `txHash`, without reading
  a receipt — as `submitBatch`'s own polling already did. Before, the guard
  asked the port for the receipt of `''`, and a port that answered with any
  receipt could turn a non-answer into `deposited`.

## 2.10.2

A bug-fix release. No API change.

### Fixed

- **`validateDepositBatchCalls` refused every batch in a browser, as
  `approve-call`.** Its canonical-encoding check re-encoded each call from
  `parsed.functionFragment`. ethers v5's `TransactionDescription` deep-copies
  that fragment into a plain object; under the CommonJS build (Node, jest) the
  copy still carries `format()` because ES5 prototype methods are enumerable,
  but under the ES-module build a bundler resolves (`lib.esm`) it carries no
  methods, so re-encoding threw and the call was reported as not an `approve`.
  The check now decodes and re-encodes against the interface's own fragment
  for the expected function, and no longer goes through `parseTransaction`'s
  copied description at all. What it accepts and refuses is unchanged:
  exactly the exact-amount approve plus the matching `requestDepositWithKyc`,
  canonical bytes, no value. The suite now also runs the validator, and both receipt
  proofs, against the ES-module copy, and pins more non-canonical encodings
  the validator refuses: non-minimal offsets, dirty `bytes` padding, dirty
  high bits in an address word and trailing bytes on the deposit.

## 2.10.1

A bug-fix release. No API change.

### Fixed

- **A matured fixed-term lock was counted twice in the portfolio summary.**
  `getPortfolioLendingData` subtracts only the LOCKED loans from a tranche's
  balance, so a matured lock's principal stays inside `investedAmount`; the
  summary fold (`Portfolio.calculateYieldMetrics`, which
  `getPortfolioSummary` and `kasu.portfolio.getPositions().summary` run) then
  added every `fixedLoans[]` entry on top, matured ones included. A lender
  with a matured lock saw `current.totalLendingPoolInvestments`,
  `weekly.yieldEarnings` / `daily.yieldEarnings` and the
  `current.weightedAverageApy` weighting overstated by that lock's value. The
  summary now equals the sum, over positions, of the variable residual plus
  each LIVE lock, each counted once. A matured lock's lifetime yield is earned
  and still counts in `lifetime.yieldEarnings`. Live locks and positions
  without locks are unchanged.

## 2.10.0

Sponsored withdraw and cancel: the single `LendingPoolManager` calls a
gas-sponsoring relay carries, encoded by the SDK with the relay's own `kind`,
and a `WithdrawFlow` that can submit through one.

### Added

- **`kasu.calls`** (`CallsFacade`) — read, then encode, never send. Each
  method returns `{ kind, call: { to, data } }`, `to` being this chain's
  `LendingPoolManager`:
  `requestWithdrawal({ poolId, trancheId, amount: BigNumber | 'max',
  userAddress })` (`withdrawal`; shares from the tranche's `convertToShares`,
  or the lender's whole `balanceOf` for `'max'` — the same helpers
  `UserLending.requestWithdrawalInAsset` / `requestWithdrawalMax` now use),
  `cancelDepositRequest(poolId, dNftId)` (`cancel_deposit`),
  `cancelWithdrawalRequest(poolId, wNftId)` (`cancel_withdrawal`),
  `withdrawAtExpiry(poolId, fixedTermDepositId)` (`withdraw_at_expiry`). A
  zero-share withdrawal, a non-positive amount or a malformed address is
  refused with `SponsoredCallInputError` before anything is sent.
- **`domain/sponsored-calls`** — the pure encoders behind it
  (`encodeRequestWithdrawalCall`, `encodeCancelDepositCall`,
  `encodeCancelWithdrawalCall`, `encodeWithdrawAtExpiryCall`),
  `SPONSORED_CALL_KINDS`, `SPONSORED_CALL_SELECTORS` (derived from the ABI),
  types `SponsoredCall`, `SponsoredCallKind`.
- **`WithdrawPorts.submitCall?(call)`** and **`encodeWithdrawal?`** — supplying
  `submitCall` turns on the sponsored path: the flow encodes the withdrawal
  (`kasu.flows.withdraw()` defaults the encoder to `kasu.calls`) and submits it
  through the port; `withdraw` / `withdrawMax` are not called. Without it,
  nothing changes. **`WithdrawState.sponsored`**, fixed at construction.
  `NO_WITHDRAWAL_ENCODER_MESSAGE`, `NOT_A_WITHDRAWAL_CALL_MESSAGE`.
- **`submitSponsoredCall(input, ports, policy?)`** — `submitBatch` for one
  call: same polling policy and outcome table; `post` receives the call with
  its kind; `wait()` resolves only on a proven executed operation. A call
  whose kind, keys or selector do not match is refused
  (`BatchSubmissionError('call_mismatch', 'failed')`) before posting. Types
  `SponsoredCallSubmissionPorts`, `SponsoredCallSubmission`, `ExecutedCall`.
- **`proveUserOperationInReceipt(receipt, { sender, userOperationHash?,
  entryPoint? })`** → `executed | reverted | unproven` — the single-call
  sibling of `proveDepositInReceipt`, sharing its operation lookup. Types
  `UserOperationProof`, `UserOperationProofExpectation`.
- **`cancelDeadline(request, nextEpochStart, nowSeconds)`** in
  `domain/requests` — the next cycle close for a cancellable `pending` (or
  live `partial`) request, else `null`.
- `UserLending.getWithdrawalSharesForAssets(tranche, amount)` and
  `getWithdrawalSharesMax(tranche, user)`.
- **`ChainConfigEntry.blockExplorerUrl`** — the chain's explorer origin,
  `https://` with no trailing slash: `https://basescan.org` (Base),
  `https://xdcscan.com` (both XDC deployments), `https://explorer.plume.org`
  (retired Plume).
- **`domain/explorer-urls`** — `explorerTxUrl(config, txHash)` and
  `explorerAddressUrl(config, address)` build `<base>/tx/<hash>` and
  `<base>/address/<address>` only from an exact 32-byte hash
  (`/^0x[0-9a-fA-F]{64}$/`) or a valid 20-byte address (checksum enforced when
  mixed-case), over an `https://` base; anything else throws. Type
  `ExplorerConfig`. Apps should link through these instead of concatenating
  strings.

### Changed

- `WithdrawFailure` gains `{ step: 'request'; reason: 'reverted';
  revertError; error }` and `{ step: 'request'; reason: 'pending' |
  'already-submitted'; error }`, produced only on the sponsored path. A
  consumer that supplies `submitCall` should add the three codes to its copy
  table; `pending` and `already-submitted` are not failures. A wallet
  rejection thrown by `submitCall` itself is `cancelled` (nothing was posted);
  a run abandoned while `submitCall` is in flight never calls `wait()`.
- `WithdrawState` has a required `sponsored` field.
- `ChainConfigEntry` has a required `blockExplorerUrl` field. A custom entry
  built by hand (rather than spread from `CHAIN_CONFIGS`) must add it to
  type-check; at runtime nothing but the explorer helpers reads it, and they
  throw a clear error when it is missing. `configOverrides` is unaffected.
- `FlowsFacade` takes an optional sixth constructor argument (the
  `CallsFacade`); `Kasu` passes it.
- `proveDepositInReceipt` and `proveUserOperationInReceipt`: without a
  `userOperationHash`, a receipt holding TWO of the sender's operations is
  `unproven` with the new reason `ambiguous-operation` (→ pending), instead of
  the first operation's verdict. With a hash nothing changes. Pass the hash
  whenever the submitter reports one.

## 2.9.0

The lend happy path and the strategy page for every consumer: rules that each
app carried its own copy of, lifted into the domain layer, plus the
sponsored-batch submission that an atomic deposit needs.

### Added

- **`domain/fixed-term`** — `availableFixedTermConfigs(tranche, address)`
  returns the fixed-term configs a wallet may actually select: `Everyone`, or
  `AllowlistedOnly` with the wallet on the list (case-insensitive; a wallet
  whose `isAllowlisted` is `false` was removed and is excluded).
  `isFixedTermConfigId` (the `'0'` variable-rate sentinel), `lockDurationDays`
  (7 days an epoch; `NaN` for a lock that is not a positive number),
  `lockDurationMonths` (whole months, `null` below 30 days), and
  `DAYS_PER_EPOCH`, `DAYS_PER_MONTH`, `MIN_DAYS_FOR_MONTHS`.
- **`StrategyPartner.region`** and **`getStrategyRegion(pool)`** — the
  strategy's region from its credit originator: `'Australia'` for the Apxium
  family, `'Global'` for PayFi. This is the word signed in the loan-agreement
  message, so it must be the word on screen.
- **`domain/yields`** — `weeklyInterest`, `dailyInterest`, `accruedInterest`
  (per pool, anchored to each pool's own last clearing, capped at one epoch),
  `projectedAnnualEarnings`, `weightedAverageApy`, `SECONDS_PER_WEEK`. NET of
  the performance fee; fail closed on an unusable fee or an unknown rate.
- **`domain/batch-proof`** — `validateDepositBatchCalls(calls, expected)` pins
  an atomic deposit batch to its run (exactly `approve(spender, A)` then
  `requestDepositWithKyc(pool, tranche, A, '0x', …)`, canonical encoding, no
  native value, optional fixed-term pin) and throws
  `DepositBatchMismatchError` on any deviation.
  `proveDepositInReceipt(receipt, expected)` reads a bundler's `handleOps`
  receipt: `deposited` (with the `dNftId`) only for THIS lender's
  `DepositRequested` of the expected tranche AND amount inside their own user
  operation; `reverted` when the operation failed; otherwise `unproven`.
  `ENTRY_POINT_V07`.
- **`flows/batch-submission`** — `submitBatch(input, ports, policy?)`: post,
  poll (3 s ×1.5 to 10 s, for 10 minutes), read the receipt, prove the
  deposit. `checkBatchOutcome` for a one-read check of an earlier submission.
  `BatchSubmissionOutcome` (`failed | pending | already-submitted`),
  `BatchSubmissionError`, `BatchPendingError`, `batchOutcomeOf`,
  `isDefinitivelyNotSubmitted`, `DEFAULT_BATCH_POLLING_POLICY`. An ambiguous
  result is never `failed`.
- **`kasu.strategies.getRiskPerformance(poolId)`** →
  `{ poolLossRate, firstLossCapital }` (each `number | null`; an unauthored
  CMS value is `null`, never `0`) and
  **`kasu.strategies.getOriginator(poolId)`** → the originator's
  `PoolDelegateProfileAndHistory`. `getRiskPerformance` resolves a pool
  through the chain's `poolMetadataMapping`; `getOriginator` matches the ids
  `DataService.getPoolDelegateProfileAndHistory` lists, which that service
  filters through the CURRENT chain's subgraph, so on the XDC deployments
  (whose CMS records are keyed by Base ids) it resolves `null` until the
  service applies the mapping.

### Changed

- `DepositFailure` gains `{ step: 'request'; reason: 'pending' |
  'already-submitted'; error }`, produced only on the batch path from a
  `BatchSubmissionError` whose outcome is not `failed`. A submission error is
  now read at its word and never through the revert decoder, so a pending
  outcome whose `cause` carries revert bytes can no longer surface as
  `reverted` or `insufficient-balance`. Consumers with a copy table keyed on
  `reason` should add the two codes; neither is a failure.
- `BatchRevertedError` moved to `flows/batch-errors.ts`; it is the same class
  and is still exported from the package root and from `flows/deposit-flow`.
- The pool query now selects `isAllowlisted` on fixed-term allowlist entries,
  so `TrancheData.fixedTermConfig[].fixedTermDepositAllowlist[].isAllowlisted`
  carries the subgraph's value instead of `undefined`.
- `StrategyPartner` has a required `region` field.
