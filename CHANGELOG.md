# Changelog

All notable changes to `@kasufinance/kasu-sdk`. Versions follow semantic
versioning; earlier releases are described in their commit messages.

## 2.10.3

Sponsored P2P transfer: the stable asset's own `transfer` as a sponsored-call
kind, so a relay client sends it through `submitSponsoredCall` like the
withdraw and cancel calls.

### Added

- **`'transfer'` in `SPONSORED_CALL_KINDS`**, with its selector
  (`0xa9059cbb`) in `SPONSORED_CALL_SELECTORS`, derived from the generated
  `IERC20Metadata` ABI and never typed in. `submitSponsoredCall` accepts a
  transfer call and proves it with `proveUserOperationInReceipt`, like every
  other single call.
- **`encodeStableTransfer({ stableAsset, to, amount })`** → `{ kind:
  'transfer', call: { to: stableAsset, data } }`. Pure. It refuses a malformed
  stable asset or recipient, the zero address as the recipient, and an amount
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

### Changed

- `SponsoredCallKind` gains `'transfer'`. A consumer with an exhaustive
  `switch` over it must add a case.

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
