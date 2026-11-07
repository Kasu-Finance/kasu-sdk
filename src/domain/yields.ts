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
 * {@link accruedInterestSince}. Build it with {@link epochAccrual}, which
 * validates every field and derives the two timestamps; do not assemble one
 * by hand.
 */
export interface EpochAccrual {
    /** That pool's projected net interest for one epoch (`weeklyInterest`). */
    weeklyInterest: number;
    /**
     * Unix SECONDS from which the pool's unpaid interest accrues: the earlier
     * of the moment its last clearing STARTED and `epochEnd`. Never after
     * `epochEnd`.
     */
    accruesFrom: number;
    /**
     * Unix SECONDS at which the pool's last cleared epoch ENDS
     * (`epochEndTimestamp(initialEpochStart, lastClearedEpoch)`). The accrual
     * holds from `accruesFrom + 604 800` until `epochEnd + 604 800`.
     */
    epochEnd: number;
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
 * @deprecated Use {@link accruedInterestSince} with {@link epochAccrual}:
 * identical while clearings run on time, and it keeps accruing, without a
 * cap, when they run late. Kept, behaviour-identical, for existing callers.
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
 * Builds one pool's {@link EpochAccrual} from what the chain and the subgraph
 * say about its last clearing:
 *
 * ```
 * epochEnd    = epochEndTimestamp(initialEpochStart, lastClearedEpoch)
 * accruesFrom = min(clearingStartedAt, epochEnd)
 * ```
 *
 * - **On time** (the clearing started inside its window, before its epoch
 *   ended): `accruesFrom` is the clearing's start. Clearing applies the
 *   epoch's interest first and only then accepts requests, so today's
 *   balance — which includes a deposit that clearing accepted — is never
 *   charged for time before it: a new lender starts at exactly 0.
 * - **Late** (it started at or after its epoch end): `accruesFrom` is the
 *   epoch end. A late clearing accepts no requests and credits exactly one
 *   epoch, so the time it did not credit is kept.
 *
 * `lastClearedEpoch` is the newest epoch whose clearing has STARTED (the
 * subgraph has a `LendingPoolClearing` for it), not the newest that has
 * finished, and `clearingStartedAt` is that clearing's `startTimestamp`.
 * `ClearingCoordinator.doClearing` mints the epoch's interest in its FIRST
 * transaction (`applyInterests`), while `nextLendingPoolClearingEpoch` only
 * advances when the clearing ENDS, so it is the wrong source.
 *
 * FAILS CLOSED with `null`: whatever {@link epochEndTimestamp} rejects, a
 * `clearingStartedAt` that is not a finite positive number, or a
 * `weeklyInterest` that is not finite or is negative. The caller then offers
 * no term for that pool.
 *
 * @param input.weeklyInterest the pool's net interest for one epoch.
 * @param input.initialEpochStart unix seconds, `epochStartTimestamp(0)`.
 * @param input.lastClearedEpoch the newest epoch whose clearing has started.
 * @param input.clearingStartedAt unix seconds, that clearing's start.
 */
export function epochAccrual(input: {
    weeklyInterest: number;
    initialEpochStart: number;
    lastClearedEpoch: number;
    clearingStartedAt: number;
}): EpochAccrual | null {
    const { weeklyInterest: weekly, clearingStartedAt } = input;
    if (!Number.isFinite(weekly) || weekly < 0) return null;
    if (!Number.isFinite(clearingStartedAt) || clearingStartedAt <= 0) {
        return null;
    }
    const epochEnd = epochEndTimestamp(
        input.initialEpochStart,
        input.lastClearedEpoch,
    );
    if (Number.isNaN(epochEnd)) return null;
    return {
        weeklyInterest: weekly,
        accruesFrom: Math.min(clearingStartedAt, epochEnd),
        epochEnd,
    };
}

/**
 * Interest accrued and not yet credited — the moving part of lifetime
 * interest (lifetime = settled on chain + this). Per term, with
 * `W` = 604 800 s:
 *
 * ```
 * accrued = weekly × ( min(max(now − accruesFrom, 0), W)
 *                    + max(now − (epochEnd + W), 0) ) / W
 * ```
 *
 * Read along the clock, for one pool:
 * 1. from `accruesFrom`, one epoch of interest accrues linearly;
 * 2. it then HOLDS from `accruesFrom + W` until `epochEnd + W`, the end of
 *    the next epoch — at most 48 h after an on-time clearing (its clearing
 *    window), no time at all after a late one (`accruesFrom == epochEnd`);
 * 3. then it resumes, with no upper cap.
 *
 * **Why no cap.** Clearing must run once per epoch for each pool, in order
 * (`ClearingCoordinator.doClearing` reverts unless the target epoch is the
 * pool's `nextLendingPoolClearingEpoch`), and every clearing, on time or
 * late, starts with `LendingPool.applyInterests(targetEpoch)`. A missed epoch
 * is therefore credited when the clearings catch up (on Base, one pool
 * cleared epochs 117, 118 and 119 in the same minute), and it keeps accruing
 * until then. The figure never freezes for longer than the hold.
 *
 * **Why the hold.** Without it an on-time anchor accrues past one epoch
 * while the next on-time clearing — which credits exactly one — is still to
 * come, and the total steps DOWN when it lands. With it, at a constant
 * balance, `settled + accrued` never steps down at a clearing (`t` = the
 * NEW clearing's start, `E` = the end of the epoch it clears):
 * - on time after on time: identical to the deprecated `accruedInterest`
 *   at every instant. With `gap` = `t` − the previous clearing's start, it
 *   steps UP by `weekly × (W − gap) / W` when `gap < W` (at most 2/7 of one
 *   weekly, as before), and not at all when `gap ≥ W`;
 * - late after on time, and late after late: exactly continuous;
 * - on time after late: steps UP by `weekly × (E − t) / W`, at most 2/7 of
 *   one weekly.
 * A deposit or top-up accepted at an on-time clearing starts at 0, so it
 * never dips the total either.
 *
 * **Never negative**, and non-decreasing in `now`. A term is skipped — it
 * contributes nothing — when `weeklyInterest` is not finite or is negative,
 * when `accruesFrom` or `epochEnd` is not finite, when `accruesFrom >
 * epochEnd` (inconsistent: the anchor is never after the epoch end), or when
 * an elapsed time overflows. A non-finite `nowSeconds` accrues nothing.
 *
 * **Per pool, because pools clear independently.** One shared anchor accrues
 * a stale pool's share from a close it never had.
 *
 * **Accepted approximation.** `weekly` is today's balance at today's epoch
 * rate. Over a multi-week gap the chain compounds weekly and may apply other
 * epochs' rates, so a long uncapped accrual reads slightly LOW. It is a
 * ticking estimate, not a ledger.
 *
 * Callers fail closed upstream: no term for a pool whose weekly interest or
 * clearing is unknown (`epochAccrual` returns `null`), and none for a pool
 * that has stopped — it will never clear again.
 */
export function accruedInterestSince(
    accruals: readonly EpochAccrual[],
    nowSeconds: number,
): number {
    if (!Number.isFinite(nowSeconds)) return 0;
    let accrued = 0;
    for (const { weeklyInterest: weekly, accruesFrom, epochEnd } of accruals) {
        if (!Number.isFinite(weekly) || weekly < 0) continue;
        if (!Number.isFinite(accruesFrom) || !Number.isFinite(epochEnd)) {
            continue;
        }
        if (accruesFrom > epochEnd) continue;
        const sinceAnchor = nowSeconds - accruesFrom;
        const sinceHoldEnd = nowSeconds - (epochEnd + SECONDS_PER_WEEK);
        if (!Number.isFinite(sinceAnchor) || !Number.isFinite(sinceHoldEnd)) {
            continue;
        }
        const elapsed =
            Math.min(Math.max(sinceAnchor, 0), SECONDS_PER_WEEK) +
            Math.max(sinceHoldEnd, 0);
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
