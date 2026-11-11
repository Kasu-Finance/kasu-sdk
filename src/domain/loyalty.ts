/**
 * Loyalty levels: the contract's rule, restated exactly, plus what each level
 * would take.
 *
 * The rule is `UserManager._userLoyaltyLevel` (kasu-contracts
 * `src/core/UserManager.sol`):
 *
 * ```
 * lent   = active + pending deposits, all of the user's pools, current epoch   (stable base units)
 * value  = rKSU × price / 1e18 / 1e12                                           (_rKSUInUSDC, floored)
 * ratio  = value × 10_000 / lent                                                (FULL_PERCENT, floored)
 *          lent = 0 and rKSU > 0  → ratio = type(uint256).max  (the top level)
 *          lent = 0 and rKSU = 0  → ratio = 0
 * level  = how many of the ascending thresholds the ratio meets, stopping at
 *          the first one it misses
 * ```
 *
 * rKSU is the LOCKING receipt, minted when KSU is locked
 * (`KSULocking._lock`: `(KSU + bonus) × rKSUMultiplier / 10_000`) and burnt
 * pro rata on unlock. KSU merely held in a wallet counts for nothing, so
 * buying KASU alone never changes a level; locking it does.
 *
 * Everything is integer `bigint`, in the contract's own units, and every
 * division rounds the way the contract's does (down) — or, for "what does
 * it take", UP to the smallest amount the contract would accept. No float
 * touches a level or a requirement. `BigInt(...)` calls only, no bigint
 * literals, so consumers on an older compile target still build.
 */

/** `FULL_PERCENT` — thresholds and the ratio are in these units (100 = 1 %). */
export const LOYALTY_FULL_PERCENT = 10_000;

/**
 * `SystemVariables.MAX_ADDITIONAL_LOYALTY_LEVELS`: the most thresholds the
 * contract accepts, so at most this many levels above level 0.
 */
export const MAX_ADDITIONAL_LOYALTY_LEVELS = 10;

/** KSU and rKSU decimals. */
export const KSU_DECIMALS = 18;

/** `ksuEpochTokenPriceFresh` is priced with this many decimals (`KSU_PRICE_MULTIPLIER`). */
export const KSU_PRICE_DECIMALS = 18;

/** `loyaltyEpochRewardRates` are fixed-point with this many decimals (`INTEREST_RATE_FULL_PERCENT`). */
export const LOYALTY_RATE_DECIMALS = 18;

const ZERO = BigInt(0);
const ONE = BigInt(1);
const FULL_PERCENT = BigInt(LOYALTY_FULL_PERCENT);
/**
 * `_rKSUInUSDC` divides by `KSU_PRICE_MULTIPLIER` (1e18) and then by 1e12 —
 * a hard-coded assumption that the stable token has 6 decimals. Two floor
 * divisions in a row equal one floor division by their product, so this is
 * the single divisor.
 */
const RKSU_VALUE_DIVISOR = BigInt('1' + '0'.repeat(30));
/**
 * `EPOCHS_IN_YEAR` (52.17857) scaled to an integer, so an epoch rate can be
 * annualised exactly. The deploy seeded its rates with the same figure
 * (`0.1 % / 52.17857 epochs`).
 */
const EPOCHS_IN_YEAR_E5 = BigInt(5_217_857);
const EPOCHS_IN_YEAR_SCALE = 5;

/** The chain state one loyalty reading is computed from, in raw units. */
export interface LoyaltyChainState {
    /** `SystemVariables.loyaltyThresholds()` — ascending, FULL_PERCENT units. */
    thresholdsBps: readonly bigint[];
    /** `SystemVariables.ksuEpochTokenPriceFresh()` — 18 decimals. */
    ksuPrice: bigint;
    /** `KSULocking.balanceOf(user)` — rKSU, 18 decimals. */
    rKsu: bigint;
    /** `KSULocking.userTotalDeposits(user)` — KSU locked incl. bonus, 18 decimals. */
    lockedKsu: bigint;
    /** `UserManager.userTotalPendingAndActiveDepositedAmountForCurrentEpoch(user)`, stable base units. */
    activeLent: bigint;
    /** Same call, second value: pending deposits tagged up to the current epoch. */
    pendingLent: bigint;
    /**
     * `UserManager.userTotalPendingAndActiveDepositedAmount(user)`, second
     * value: pending deposits tagged up to the NEXT epoch — a superset that
     * includes requests made during the clearing window, which the next
     * clearing will count.
     */
    pendingLentNextEpoch: bigint;
    /**
     * `UserLoyaltyRewards.loyaltyEpochRewardRates(level)` for level 0 up to at
     * least `thresholdsBps.length`; 18-decimal fraction per epoch.
     */
    epochRewardRates: readonly bigint[];
    /**
     * Decimals of the deployment's stable token. Must be 6: `_rKSUInUSDC`
     * hard-codes the 1e12 between rKSU and a 6-decimal stable.
     */
    stableDecimals: number;
}

/**
 * One level and what reaching it takes, at `requirementLentUsd` and today's
 * price.
 *
 * Every figure is an exact MINIMUM, not a safe amount to buy: interest
 * accruing on the lent amount, a new deposit and a KSU price move all raise
 * it before the level is next recorded at clearing, and buying costs fees and
 * slippage. Add headroom, and count KASU the lender already holds unlocked.
 */
export interface LoyaltyLevelRequirement {
    level: number;
    /** The threshold in FULL_PERCENT units (100 = 1 %); `0` for level 0. */
    thresholdBps: number;
    /**
     * True when the lender's state NOW meets this level — `n ≤ level`, the
     * contract's own reading. A reached level can still show an
     * `additionalKsu` above 0 when a deposit waiting for the next clearing
     * raises the bar.
     */
    reached: boolean;
    /**
     * The smallest locked value, in the stable token, the contract counts as
     * meeting the threshold: `ceil(threshold × lent / 10_000)` with
     * `lent = requirementLentUsd`. `'0'` when nothing is lent — the contract
     * then gives ANY rKSU every level, so `additionalLockedValueUsd` is `'0'`
     * while `reached` can be false and `additionalKsu` is 1 wei
     * (`'0.000000000000000001'`): the lender needs to lock anything at all.
     */
    requiredLockedValueUsd: string;
    /** `max(required − current locked value, 0)`. */
    additionalLockedValueUsd: string;
    /**
     * The smallest rKSU balance that reaches the level — the exact amount, in
     * rKSU, that `_userLoyaltyLevel` would count as enough. `null` when the
     * level cannot be reached at the current price (a price of 0 makes every
     * locked balance worth 0 while something is lent).
     */
    requiredRksu: string | null;
    /**
     * How much more KASU must be LOCKED to reach the level: `max(requiredRksu
     * − rKSU, 0)` — `'0'` when the current rKSU already covers it, `null`
     * when it cannot be reached.
     *
     * Counted at full locking weight — a lock whose rKSU multiplier is
     * 100 % (the 720-day lock on Base) mints 1 rKSU per KASU, exactly. A
     * shorter lock mints less (30 d 5 %, 180 d 25 %, 360 d 50 % on Base) and
     * `_lock` floors what it mints, so never divide this by a percentage:
     * `ksuToLockFor(additionalRksu, multiplier)` gives the exact amount for
     * another lock. A lock bonus (when the bonus pool has funds) only adds
     * to what is minted, so the amount is enough with or without one.
     * Buying KASU without locking it changes nothing.
     */
    additionalKsu: string | null;
}

/** One level's KSU bonus rate. */
export interface LoyaltyBonusRate {
    level: number;
    /** Per epoch, as a fraction (`'0.000019164956034632'`). */
    epochRate: string;
    /**
     * The epoch rate × `EPOCHS_IN_YEAR`, in PERCENT, exact (not compounded —
     * the way the rates were set: `0.1 % / 52.17857`). Format it for display.
     */
    annualPct: string;
}

/** `kasu.loyalty.getStatus` on a deployment that has the loyalty programme. */
export interface LoyaltyStatusSupported {
    supported: true;
    /** The block every figure was read at. */
    blockNumber: number;
    /** `SystemVariables.currentEpochNumber()` at that block. */
    epoch: number;
    /**
     * The level the contract computes now (`UserManager.userLoyaltyLevel`,
     * cross-checked against the SDK's own reading). Clearing priority and the
     * KSU bonus use the level stored at each epoch's clearing, so this is the
     * level the NEXT clearing will record if nothing changes.
     */
    level: number;
    /** `thresholdsBps.length + 1` — level 0 has no threshold. */
    levelCount: number;
    /** On-chain thresholds, FULL_PERCENT units (100 = 1 %). */
    thresholdsBps: number[];
    /**
     * Locked value / lent, FULL_PERCENT units, floored like the contract.
     * `null` when nothing is lent: the contract then gives any rKSU the top
     * level and no rKSU level 0 (or the levels whose threshold is 0). Exact
     * below 2^53.
     */
    ratioBps: number | null;
    /** KASU locked, including any lock bonus (`KSULocking.userTotalDeposits`). */
    lockedKsu: string;
    /** rKSU — the locking weight the level counts (`KSULocking.balanceOf`). */
    rKsu: string;
    /** rKSU × price, floored to the stable's base unit — the value the level counts. */
    lockedValueUsd: string;
    /** `ksuEpochTokenPriceFresh` — the price the level uses. */
    ksuPriceUsd: string;
    /**
     * Lent in the deployment's stable token (USDC on Base), as the level
     * counts it now: active plus pending deposits tagged up to this epoch.
     */
    lentUsd: { active: string; pending: string; total: string };
    /**
     * The lent amount `levels[]` requirements are computed at: the larger of
     * `lentUsd.total` and active plus pending deposits tagged up to the NEXT
     * epoch (requests made during the clearing window, which the next
     * clearing counts). So a requirement is never below what the next
     * clearing will ask for on today's deposits.
     */
    requirementLentUsd: string;
    bonusRatePerLevel: LoyaltyBonusRate[];
    /** Every level, 0 to `levelCount − 1`. */
    levels: LoyaltyLevelRequirement[];
}

/** `kasu.loyalty.getStatus` on a deployment without the loyalty programme. */
export interface LoyaltyStatusUnsupported {
    supported: false;
    /** Lite deployments (XDC AUDD, XDC USDC) have no KSU, locking or levels. */
    reason: 'lite-deployment';
}

export type LoyaltyStatus = LoyaltyStatusSupported | LoyaltyStatusUnsupported;

/** `ceil(a / b)` for `a ≥ 0`, `b > 0`. */
function ceilDiv(a: bigint, b: bigint): bigint {
    return (a + b - ONE) / b;
}

/**
 * An exact decimal string of `value / 10^decimals`: no exponent, no trailing
 * zeros, no trailing point (`'2'`, `'0.05'`, `'-1.5'`).
 */
export function formatExactDecimal(value: bigint, decimals: number): string {
    if (!Number.isInteger(decimals) || decimals < 0) {
        throw new RangeError(
            `formatExactDecimal: bad decimals ${String(decimals)}`,
        );
    }
    const negative = value < ZERO;
    const digits = (negative ? -value : value).toString();
    if (decimals === 0) return (negative ? '-' : '') + digits;
    const padded = digits.padStart(decimals + 1, '0');
    const whole = padded.slice(0, padded.length - decimals);
    const frac = padded.slice(padded.length - decimals).replace(/0+$/, '');
    return (negative ? '-' : '') + whole + (frac ? '.' + frac : '');
}

/** `_rKSUInUSDC`: the stable value the contract gives an rKSU balance. */
export function rKsuValue(rKsu: bigint, ksuPrice: bigint): bigint {
    return (rKsu * ksuPrice) / RKSU_VALUE_DIVISOR;
}

/**
 * The contract's ratio in FULL_PERCENT units, or `'max'` for
 * `type(uint256).max` (nothing lent, some rKSU).
 */
export function loyaltyRatioBps(
    rKsu: bigint,
    ksuPrice: bigint,
    lent: bigint,
): bigint | 'max' {
    if (lent > ZERO) return (rKsuValue(rKsu, ksuPrice) * FULL_PERCENT) / lent;
    return rKsu > ZERO ? 'max' : ZERO;
}

/** `_userLoyaltyLevel`: thresholds met in order, stopping at the first miss. */
export function loyaltyLevelOf(
    rKsu: bigint,
    ksuPrice: bigint,
    lent: bigint,
    thresholdsBps: readonly bigint[],
): number {
    const ratio = loyaltyRatioBps(rKsu, ksuPrice, lent);
    let level = 0;
    for (const threshold of thresholdsBps) {
        if (ratio === 'max' || ratio >= threshold) level++;
        else break;
    }
    return level;
}

/**
 * The smallest locked VALUE (stable base units) whose ratio meets
 * `thresholdBps`: `floor(v × 10_000 / lent) ≥ T  ⇔  v ≥ ceil(T × lent / 10_000)`.
 * With nothing lent the value is irrelevant (the ratio is 0 or max), so 0.
 */
export function requiredLockedValue(
    thresholdBps: bigint,
    lent: bigint,
): bigint {
    if (lent <= ZERO) return ZERO;
    return ceilDiv(thresholdBps * lent, FULL_PERCENT);
}

/**
 * The smallest rKSU balance that meets `thresholdBps`, or `null` when no
 * balance can (price 0 while something is lent and the threshold is above 0).
 *
 * - `T = 0`: every state meets it (the ratio is never negative) → 0.
 * - nothing lent: the ratio is 0 with no rKSU and max with any → 1 wei.
 * - otherwise: `floor(r × p / 1e30) ≥ V  ⇔  r ≥ ceil(V × 1e30 / p)`, with
 *   `V = requiredLockedValue(T, lent)`.
 */
export function requiredRksuFor(
    thresholdBps: bigint,
    lent: bigint,
    ksuPrice: bigint,
): bigint | null {
    if (thresholdBps <= ZERO) return ZERO;
    if (lent <= ZERO) return ONE;
    const value = requiredLockedValue(thresholdBps, lent);
    if (ksuPrice <= ZERO) return null;
    return ceilDiv(value * RKSU_VALUE_DIVISOR, ksuPrice);
}

/**
 * The smallest KASU amount whose lock mints at least `rKsu`, for a lock
 * period with rKSU multiplier `rKsuMultiplierBps` (FULL_PERCENT units,
 * `KSULocking.lockDetails(period).rKSUMultiplier`; 10 000 = 1 rKSU per KASU).
 *
 * `_lock` mints `floor((amount + bonus) × multiplier / 10_000)`, so
 * `floor(a × m / 10_000) ≥ R  ⇔  a ≥ ceil(R × 10_000 / m)`. The bonus is
 * left out: it is capped by what the bonus pool holds and only ever adds, so
 * the result is enough with or without it. `null` for a multiplier of 0 (a
 * lock that mints nothing). Both in 18-decimal base units.
 */
export function ksuToLockFor(
    rKsu: bigint,
    rKsuMultiplierBps: bigint,
): bigint | null {
    if (rKsu <= ZERO) return ZERO;
    if (rKsuMultiplierBps <= ZERO) return null;
    return ceilDiv(rKsu * FULL_PERCENT, rKsuMultiplierBps);
}

/** An 18-decimal epoch rate × `EPOCHS_IN_YEAR`, in percent, exact. */
export function annualPctOfEpochRate(epochRate: bigint): string {
    // rate / 1e18 × 52.17857 × 100  =  rate × 5_217_857 / 10^(18 + 5 − 2)
    return formatExactDecimal(
        epochRate * EPOCHS_IN_YEAR_E5,
        LOYALTY_RATE_DECIMALS + EPOCHS_IN_YEAR_SCALE - 2,
    );
}

function toSafeNumber(value: bigint, what: string): number {
    if (value < ZERO || value > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new RangeError(
            `loyalty: ${what} out of range (${value.toString()})`,
        );
    }
    return Number(value);
}

/**
 * The full status from raw chain values. Pure: the facade reads the chain and
 * hands the result here.
 *
 * Throws a `RangeError` when the state is outside what the contract allows —
 * thresholds out of order or more than `MAX_ADDITIONAL_LOYALTY_LEVELS`, a
 * missing rate, a negative amount — rather than return a figure it cannot
 * stand behind.
 */
export function buildLoyaltyStatus(
    state: LoyaltyChainState,
    meta: { blockNumber: number; epoch: number },
): LoyaltyStatusSupported {
    const {
        thresholdsBps,
        ksuPrice,
        rKsu,
        lockedKsu,
        activeLent,
        pendingLent,
        pendingLentNextEpoch,
        epochRewardRates,
        stableDecimals,
    } = state;

    if (stableDecimals !== 6) {
        throw new RangeError(
            `loyalty: the contract values rKSU for a 6-decimal stable, not ${String(stableDecimals)}`,
        );
    }
    if (thresholdsBps.length > MAX_ADDITIONAL_LOYALTY_LEVELS) {
        throw new RangeError(
            `loyalty: ${String(thresholdsBps.length)} thresholds, the contract allows ${String(MAX_ADDITIONAL_LOYALTY_LEVELS)}`,
        );
    }
    for (let i = 0; i < thresholdsBps.length; i++) {
        if (thresholdsBps[i] < ZERO) {
            throw new RangeError('loyalty: negative threshold');
        }
        if (i > 0 && thresholdsBps[i] < thresholdsBps[i - 1]) {
            throw new RangeError('loyalty: thresholds are not ascending');
        }
    }
    if (epochRewardRates.length < thresholdsBps.length + 1) {
        throw new RangeError('loyalty: a reward rate is missing for a level');
    }
    for (const amount of [
        ksuPrice,
        rKsu,
        lockedKsu,
        activeLent,
        pendingLent,
        pendingLentNextEpoch,
    ]) {
        if (amount < ZERO) throw new RangeError('loyalty: negative amount');
    }
    for (const rate of epochRewardRates) {
        if (rate < ZERO) throw new RangeError('loyalty: negative reward rate');
    }

    const lent = activeLent + pendingLent;
    const nextLent = activeLent + pendingLentNextEpoch;
    const requirementLent = nextLent > lent ? nextLent : lent;
    const value = rKsuValue(rKsu, ksuPrice);
    const ratio = loyaltyRatioBps(rKsu, ksuPrice, lent);
    const level = loyaltyLevelOf(rKsu, ksuPrice, lent, thresholdsBps);
    const stable = (v: bigint): string => formatExactDecimal(v, stableDecimals);

    const thresholdsWithBase = [ZERO, ...thresholdsBps];
    const levels: LoyaltyLevelRequirement[] = thresholdsWithBase.map(
        (threshold, n) => {
            const reached = n <= level;
            const requiredValue = requiredLockedValue(
                threshold,
                requirementLent,
            );
            const requiredRksu = requiredRksuFor(
                threshold,
                requirementLent,
                ksuPrice,
            );
            const additionalRksu =
                requiredRksu === null
                    ? null
                    : requiredRksu > rKsu
                      ? requiredRksu - rKsu
                      : ZERO;
            return {
                level: n,
                thresholdBps: toSafeNumber(threshold, 'threshold'),
                reached,
                requiredLockedValueUsd: stable(requiredValue),
                additionalLockedValueUsd: stable(
                    requiredValue > value ? requiredValue - value : ZERO,
                ),
                requiredRksu:
                    requiredRksu === null
                        ? null
                        : formatExactDecimal(requiredRksu, KSU_DECIMALS),
                additionalKsu:
                    additionalRksu === null
                        ? null
                        : formatExactDecimal(additionalRksu, KSU_DECIMALS),
            };
        },
    );

    return {
        supported: true,
        blockNumber: meta.blockNumber,
        epoch: meta.epoch,
        level,
        levelCount: thresholdsBps.length + 1,
        thresholdsBps: thresholdsBps.map((t) => toSafeNumber(t, 'threshold')),
        ratioBps: lent === ZERO || ratio === 'max' ? null : Number(ratio),
        lockedKsu: formatExactDecimal(lockedKsu, KSU_DECIMALS),
        rKsu: formatExactDecimal(rKsu, KSU_DECIMALS),
        lockedValueUsd: stable(value),
        ksuPriceUsd: formatExactDecimal(ksuPrice, KSU_PRICE_DECIMALS),
        lentUsd: {
            active: stable(activeLent),
            pending: stable(pendingLent),
            total: stable(lent),
        },
        requirementLentUsd: stable(requirementLent),
        bonusRatePerLevel: thresholdsWithBase.map((_, n) => ({
            level: n,
            epochRate: formatExactDecimal(
                epochRewardRates[n],
                LOYALTY_RATE_DECIMALS,
            ),
            annualPct: annualPctOfEpochRate(epochRewardRates[n]),
        })),
        levels,
    };
}
