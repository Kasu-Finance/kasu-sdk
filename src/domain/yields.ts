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

/** One pool's contribution to the current cycle's accrual. */
export interface PoolAccrual {
    /** That pool's projected net interest for one epoch (`weeklyInterest`). */
    weeklyInterest: number;
    /** Unix SECONDS at which THAT pool last cleared a cycle. */
    clearingTimestamp: number;
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
 * Interest accrued since each pool's OWN last cycle close — the moving part
 * of lifetime interest (lifetime = settled on chain + this).
 *
 * ```
 * accrued = Σ_pool  weekly_pool × clamp(now − clearing_pool, 0, 604 800) / 604 800
 * ```
 *
 * **Per pool, because pools clear independently.** One shared anchor accrues
 * a stale pool's share from a close it never had, and when another pool
 * clears it drops the total by the stale pool's whole weekly share. Anchored
 * per pool, the total is monotonic across any single pool's clearing: that
 * pool swaps its accrued share for a capitalised one, and no other term moves.
 *
 * **The one-epoch cap is load-bearing.** Clearings are not exactly weekly,
 * and `weeklyInterest` is per EPOCH, so extrapolating past seven days would
 * promise interest the close will not credit; a late clearing under-reports
 * instead. The low clamp makes a close ahead of the local clock zero, never
 * negative.
 *
 * A non-finite term contributes nothing; a non-finite `nowSeconds` accrues
 * nothing. Callers fail closed upstream by not offering an accrual for a pool
 * whose weekly interest or anchor is unknown.
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
