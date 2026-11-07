/**
 * Forward-looking interest on a lender's CURRENT balances — the figures a
 * portfolio shows as "weekly", "daily" and the moving part of "lifetime"
 * interest, and the "≈ $Y a year" line beside a lend amount.
 *
 * Every figure is NET of the platform performance fee, the way the chain
 * credits it: `LendingPool._applyTrancheInterest` mints the lender
 * `interest × (1 − performanceFee)` at each cycle close, and only that net
 * amount ever reaches the balance. A gross projection would out-run what the
 * next close actually credits.
 *
 * Units: balances and results are display units of the deployment's stable
 * asset (not base units); rates are 0..1 fractions; `feePercent` is a
 * PERCENTAGE IN 0..100 — see `netEffectiveApy`.
 */

/**
 * Seconds in one epoch's nominal week. The per-epoch rate covers exactly this
 * window, and the accrual spreads an epoch's interest across it.
 */
export const SECONDS_PER_WEEK = 604_800;

/** One slice of a position that earns at a single rate. */
export interface InterestSlice {
    /** The lender's current balance in this slice, in stable display units. */
    balance: number;
    /**
     * The RAW per-epoch rate the chain applies to this slice at each close,
     * as a 0..1 fraction (`0.00285` ≈ 0.285% an epoch) — the subgraph's
     * `TrancheData.interestRate` or a fixed-term config's
     * `epochInterestRate`. Never derived from an APY.
     *
     * NON-FINITE means UNKNOWN, not zero. A zero is a genuinely zero
     * configured rate and contributes a real 0; the two must stay
     * distinguishable.
     */
    epochRate: number;
}

/**
 * One pool's contribution to the current cycle's accrual, anchored on its
 * last clearing TRANSACTION.
 *
 * @deprecated Use {@link EpochAccrual} with {@link accruedInterestSince}. A
 * clearing transaction's timestamp is the wrong anchor: see `accruedInterest`.
 */
export interface PoolAccrual {
    /** That pool's projected net interest for one epoch (`weeklyInterest`). */
    weeklyInterest: number;
    /** Unix SECONDS at which THAT pool last cleared a cycle. */
    clearingTimestamp: number;
}

/**
 * One pool's contribution to the unpaid interest — the input of
 * {@link accruedInterestSince}.
 */
export interface EpochAccrual {
    /** That pool's projected net interest for one epoch (`weeklyInterest`). */
    weeklyInterest: number;
    /**
     * Unix SECONDS from which the pool's unpaid interest accrues —
     * `accrualStartTimestamp(initialEpochStart, lastClearedEpoch,
     * clearingStartedAt)`: the earlier of the moment the pool's last clearing
     * STARTED and the end of the epoch it cleared.
     *
     * "Last cleared epoch" is the newest epoch whose clearing has STARTED (the
     * subgraph has a `LendingPoolClearing` for it), not the newest that has
     * finished. `ClearingCoordinator.doClearing` mints the epoch's interest in
     * its FIRST transaction (`applyInterests`), while
     * `nextLendingPoolClearingEpoch` only advances when the clearing ENDS.
     */
    accruesFrom: number;
}

function isUsableFeePercent(feePercent: number | null): feePercent is number {
    return (
        feePercent !== null &&
        Number.isFinite(feePercent) &&
        feePercent >= 0 &&
        feePercent <= 100
    );
}

/**
 * Interest the slices accrue over ONE epoch, net of the fee.
 *
 * ```
 * weekly = Σ(slice.balance × slice.epochRate) × (1 − feePercent / 100)
 * ```
 *
 * **The rate is the raw per-epoch one, never the APY.** An APY is that rate
 * already compounded over `EPOCHS_IN_YEAR`; dividing it by 365 charges a day
 * of compounded annual growth to a single day and overstates it.
 *
 * FAILS CLOSED, returning `null` rather than a wrong number:
 * - a `null`, non-finite or out-of-domain fee — a fee-less projection dressed
 *   up as the lender's net earnings is the failure this guards;
 * - any slice with a POSITIVE balance and a non-finite rate — skipping it
 *   would return a silently partial total, quietly missing that slice.
 *
 * Non-finite and non-positive BALANCES are skipped: a slice with nothing in it
 * earns nothing whatever its rate, so it cannot hide earnings. A portfolio
 * with nothing lent is therefore a legitimate `0`, never `null`.
 */
export function weeklyInterest(
    slices: readonly InterestSlice[],
    feePercent: number | null,
): number | null {
    if (!isUsableFeePercent(feePercent)) return null;
    let gross = 0;
    for (const slice of slices) {
        if (!Number.isFinite(slice.balance) || slice.balance <= 0) continue;
        if (!Number.isFinite(slice.epochRate)) return null;
        gross += slice.balance * slice.epochRate;
    }
    return gross * (1 - feePercent / 100);
}

/**
 * A day's share of the epoch's net interest: a seventh of it, NOT a
 * de-compounded daily rate. The chain mints interest once per epoch, so
 * nothing compounds within the cycle and the accrual is linear across it.
 *
 * Fails closed with its input: `null` or non-finite → `null`.
 */
export function dailyInterest(weekly: number | null): number | null {
    if (weekly === null || !Number.isFinite(weekly)) return null;
    return weekly / 7;
}

/**
 * Interest accrued since each pool's OWN last clearing transaction, capped at
 * one epoch per pool.
 *
 * ```
 * accrued = Σ_pool  weekly_pool × clamp(now − clearing_pool, 0, 604 800) / 604 800
 * ```
 *
 * Per pool, because pools clear independently: one shared anchor accrues a
 * stale pool's share from a close it never had, and when another pool clears
 * it drops the total by the stale pool's whole weekly share.
 *
 * **The one-epoch cap rested on a wrong premise.** It assumed a late
 * clearing credits only one epoch, so accruing past seven days would promise
 * interest no close pays. The contracts say otherwise. `ClearingCoordinator`
 * states that clearing "must be executed once per epoch for each lending
 * pool" and that "clearing epochs must be executed in order"; `doClearing`
 * reverts unless the target epoch is the pool's `nextLendingPoolClearingEpoch`,
 * and it calls `LendingPool.applyInterests(targetEpoch)` on every clearing,
 * late or not ("if clearing for the epoch is executed only after the clearing
 * period, only yield will be applied"). Every missed epoch's interest is
 * therefore credited when the clearings catch up — on Base, one pool cleared
 * epochs 117, 118 and 119 in the same minute, three weeks credited at once.
 * Capped, the figure freezes as soon as a clearing is a week late; anchored
 * on the transaction, it also DIPS on a catch-up (elapsed resets to zero
 * while only one week is credited per clearing).
 *
 * The low clamp makes a close ahead of the local clock zero, never negative.
 * A non-finite term contributes nothing; a non-finite `nowSeconds` accrues
 * nothing.
 *
 * @deprecated Use {@link accruedInterestSince} with
 * {@link accrualStartTimestamp}: the same transaction anchor for an on-time
 * clearing, the epoch end for a late one, and no cap. Kept,
 * behaviour-identical, for existing callers.
 */
export function accruedInterest(
    accruals: readonly PoolAccrual[],
    nowSeconds: number,
): number {
    if (!Number.isFinite(nowSeconds)) return 0;
    let accrued = 0;
    for (const { weeklyInterest: weekly, clearingTimestamp } of accruals) {
        if (!Number.isFinite(weekly) || !Number.isFinite(clearingTimestamp)) {
            continue;
        }
        const elapsed = Math.min(
            Math.max(nowSeconds - clearingTimestamp, 0),
            SECONDS_PER_WEEK,
        );
        accrued += (weekly * elapsed) / SECONDS_PER_WEEK;
    }
    return accrued;
}

/**
 * Unix SECONDS at which `epoch` ENDS — the start of the next one:
 *
 * ```
 * epochEnd(e) = initialEpochStart + (e + 1) × 604 800
 * ```
 *
 * `SystemVariables.epochStartTimestamp(e)` is `initial + e × EPOCH_DURATION`,
 * and the initial start is written once, at initialisation, so the end of any
 * epoch follows from `epochStartTimestamp(0)` with no further read.
 *
 * FAILS CLOSED with `NaN`: a non-integer, non-finite or negative epoch, an
 * initial start that is not a positive integer, or a result past
 * `Number.MAX_SAFE_INTEGER`.
 *
 * @param initialEpochStart unix seconds, `epochStartTimestamp(0)`.
 * @param epoch the epoch number, 0-based.
 */
export function epochEndTimestamp(
    initialEpochStart: number,
    epoch: number,
): number {
    if (!Number.isSafeInteger(initialEpochStart) || initialEpochStart <= 0) {
        return NaN;
    }
    if (!Number.isSafeInteger(epoch) || epoch < 0) return NaN;
    const end = initialEpochStart + (epoch + 1) * SECONDS_PER_WEEK;
    return Number.isSafeInteger(end) ? end : NaN;
}

/**
 * Unix SECONDS from which a pool's unpaid interest accrues — the
 * `accruesFrom` of its {@link EpochAccrual}:
 *
 * ```
 * accrualStart = min(clearingStartedAt, epochEnd(lastClearedEpoch))
 * ```
 *
 * - **On time** (the clearing started inside its window, before its epoch
 *   ended): the clearing's start. A deposit that clearing accepted therefore
 *   starts accruing at 0. Clearing applies the epoch's interest first and
 *   only then accepts requests, so today's balance — which includes that
 *   deposit — must not be charged for any time before the clearing.
 * - **Late** (it started after its epoch ended): the epoch's end. A late
 *   clearing accepts no requests and credits exactly one epoch, so anchoring
 *   on the epoch end keeps the time it did not credit: consecutive late
 *   catch-ups keep `settled + accrued` continuous.
 *
 * `lastClearedEpoch` is the newest epoch whose clearing has STARTED (a
 * `LendingPoolClearing` exists for it), and `clearingStartedAt` that
 * clearing's `startTimestamp`. `ClearingCoordinator.doClearing` mints the
 * epoch's interest in its first transaction (`applyInterests`);
 * `nextLendingPoolClearingEpoch` only advances when the clearing ends, so it
 * is the wrong source.
 *
 * FAILS CLOSED with `NaN`: whatever {@link epochEndTimestamp} rejects, or a
 * `clearingStartedAt` that is not a finite positive number.
 *
 * @param initialEpochStart unix seconds, `epochStartTimestamp(0)`.
 * @param lastClearedEpoch the newest epoch whose clearing has started.
 * @param clearingStartedAt unix seconds, that clearing's start.
 */
export function accrualStartTimestamp(
    initialEpochStart: number,
    lastClearedEpoch: number,
    clearingStartedAt: number,
): number {
    const epochEnd = epochEndTimestamp(initialEpochStart, lastClearedEpoch);
    if (Number.isNaN(epochEnd)) return NaN;
    if (!Number.isFinite(clearingStartedAt) || clearingStartedAt <= 0) {
        return NaN;
    }
    return Math.min(clearingStartedAt, epochEnd);
}

/**
 * Interest accrued and not yet credited — the moving part of lifetime
 * interest (lifetime = settled on chain + this).
 *
 * ```
 * accrued = Σ_pool  weekly_pool × max(now − accruesFrom_pool, 0) / 604 800      (no upper cap)
 * ```
 *
 * where `accruesFrom` is {@link accrualStartTimestamp}.
 *
 * **No upper cap.** Clearing must run once per epoch for each pool, in order
 * (`ClearingCoordinator.doClearing` reverts unless the target epoch is the
 * pool's `nextLendingPoolClearingEpoch`), and every clearing, on time or late,
 * starts with `LendingPool.applyInterests(targetEpoch)`. So a missed epoch is
 * credited when the clearings catch up (on Base, one pool cleared epochs 117,
 * 118 and 119 in the same minute), and it keeps accruing until then. The
 * figure never freezes.
 *
 * **Never negative.** Each term is clamped at 0, so an anchor ahead of the
 * local clock contributes nothing.
 *
 * **Per pool, because pools clear independently.** One shared anchor accrues
 * a stale pool's share from a close it never had.
 *
 * **What a clearing does to `settled + accrued`** (balance unchanged across
 * it; `W` = 604 800 s, `t` = the clearing's start):
 * - late after late: exactly continuous — one epoch credited, the anchor
 *   moves by exactly one epoch;
 * - the FIRST late catch-up after an on-time clearing at `t`: DIPS once by
 *   `weekly × (epochEnd − t) / W` — at most 48 h, so at most 2/7 of one
 *   weekly — because the on-time anchor started before its epoch ended;
 * - an on-time clearing after a late one: rises by
 *   `weekly × (epochEnd − t) / W`, at most 2/7 of one weekly;
 * - on time after on time, `gap` apart: moves by `weekly × (W − gap) / W`.
 *   Clearing windows are a week apart and 48 h long, so `|W − gap| ≤ 48 h`:
 *   a rise when the clearings are closer than a week, a dip of at most 2/7 of
 *   one weekly when they are further apart.
 *
 * **Accepted approximation.** `weekly` is today's balance at today's epoch
 * rate. Over a multi-week gap the chain compounds weekly and may apply other
 * epochs' rates, so a long uncapped accrual reads slightly LOW. It is a
 * ticking estimate, not a ledger.
 *
 * A term with a non-finite or negative `weeklyInterest`, a non-finite
 * `accruesFrom`, or an elapsed time that overflows contributes nothing; a
 * non-finite `nowSeconds` accrues nothing. Callers fail closed upstream by not offering a term for a pool
 * whose weekly interest or anchor is unknown, and by offering none for a pool
 * that has stopped (it will never clear again).
 */
export function accruedInterestSince(
    accruals: readonly EpochAccrual[],
    nowSeconds: number,
): number {
    if (!Number.isFinite(nowSeconds)) return 0;
    let accrued = 0;
    for (const { weeklyInterest: weekly, accruesFrom } of accruals) {
        if (!Number.isFinite(weekly) || weekly < 0) continue;
        if (!Number.isFinite(accruesFrom)) continue;
        const elapsed = Math.max(nowSeconds - accruesFrom, 0);
        if (!Number.isFinite(elapsed)) continue;
        accrued += (weekly * elapsed) / SECONDS_PER_WEEK;
    }
    return accrued;
}

/**
 * What `amount` earns in a year at a NET rate — the "≈ $Y a year" line.
 * Feed it `netEffectiveApy(...)`, never a gross APY: the result is a lender's
 * earnings, so the fee must already be off the rate.
 *
 * FAILS CLOSED: a non-finite or negative amount or rate returns `NaN`, which
 * the consumer renders as "no figure" — exactly what `netEffectiveApy`
 * returns when the fee is unknown, so that state carries straight through.
 *
 * @param amount display units of the stable asset.
 * @param netApy the net effective annual rate as a 0..1 fraction.
 */
export function projectedAnnualEarnings(
    amount: number,
    netApy: number,
): number {
    if (!Number.isFinite(amount) || amount < 0) return NaN;
    if (!Number.isFinite(netApy) || netApy < 0) return NaN;
    return amount * netApy;
}

/**
 * Balance-weighted average APY across slices, skipping non-finite and
 * non-positive balances and non-finite rates; `0` when nothing carries a
 * positive balance. Whatever basis goes in comes out — feed it NET rates for
 * an average effective (net) rate.
 */
export function weightedAverageApy(
    slices: readonly { balance: number; apy: number }[],
): number {
    let totalBalance = 0;
    let weighted = 0;
    for (const slice of slices) {
        if (!Number.isFinite(slice.balance) || !Number.isFinite(slice.apy)) {
            continue;
        }
        if (slice.balance <= 0) continue;
        totalBalance += slice.balance;
        weighted += slice.balance * slice.apy;
    }
    if (totalBalance <= 0) return 0;
    return weighted / totalBalance;
}
