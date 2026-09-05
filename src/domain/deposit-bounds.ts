import { TrancheData } from '../services/DataService/types';

// Fallbacks if the selected tranche's on-chain min/max are 0 / NaN (some
// "coming soon" pools haven't been configured yet).
export const MIN_LENDING_AMOUNT_FALLBACK = 500;
export const MAX_LENDING_AMOUNT_FALLBACK = 500_000;

export function parseTrancheBound(
    raw: string | number | null | undefined,
): number | null {
    if (raw == null) return null;
    const n = typeof raw === 'string' ? parseFloat(raw) : raw;
    return Number.isFinite(n) && n > 0 ? n : null;
}

export interface DepositBounds {
    minDeposit: number;
    maxDeposit: number;
}

/**
 * Min + max lending amount (in whole stable units) for a tranche. The max is
 * clamped by the tranche's *remaining* capacity: a tranche can fill mid-epoch
 * while `maximumDeposit` stays at its configured value, so without the clamp
 * a form would accept an amount the contract will reject. Mirrors
 * kasu-fe-next's `calculateDepositMinMax` (`trancheMax = min(max, capacity)`).
 */
export function resolveDepositBounds(
    tranche: TrancheData | undefined,
): DepositBounds {
    const minDeposit =
        parseTrancheBound(tranche?.minimumDeposit) ??
        MIN_LENDING_AMOUNT_FALLBACK;
    const configuredMax =
        parseTrancheBound(tranche?.maximumDeposit) ??
        MAX_LENDING_AMOUNT_FALLBACK;
    if (!tranche) return { minDeposit, maxDeposit: configuredMax };
    const remainingCapacity = Math.max(
        0,
        parseFloat(tranche.poolCapacity) || 0,
    );
    return { minDeposit, maxDeposit: Math.min(configuredMax, remainingCapacity) };
}

export interface BoundShortcuts {
    min: number;
    max: number;
    enabled: boolean;
}

/**
 * The values a lend form's clickable Min/Max labels write into the amount
 * field. Derived from the validated bounds but snapped to whole cents
 * CONSERVATIVELY — the min rounds UP, the max rounds DOWN — so a shortcut can
 * never fill an amount the form's own `min ≤ amount ≤ max` check rejects, and
 * never carries the SDK's float noise into the field (`targetDrawAmount -
 * pendingDeposits` routinely yields `249999.99999999997`, which would make the
 * label, the field's 2dp display and the signed request label all disagree).
 *
 * `enabled` is false when the snapped range is empty: a tranche at capacity
 * (max clamps to 0 or to sub-cent dust), a remaining capacity below the
 * tranche minimum, or a jurisdiction floor above the capacity. Nothing either
 * shortcut could write would validate, so both render inert.
 */
export function resolveBoundShortcuts(
    minDeposit: number,
    maxDeposit: number,
): BoundShortcuts {
    const min = ceilToCents(minDeposit);
    const max = floorToCents(maxDeposit);
    const enabled =
        Number.isFinite(min) && Number.isFinite(max) && max > 0 && max >= min;
    return { min, max, enabled };
}

/**
 * True when no amount exists that satisfies both bounds — the minimum sits
 * ABOVE the maximum, so the range a form would otherwise print ("Min 360,000 ·
 * Max 25,285") is a contradiction, not an instruction. Happens when a
 * tranche's remaining capacity falls under its own configured minimum, when it
 * is at capacity (max 0 / sub-cent dust), or when the AU wholesale cumulative
 * floor lands above the capacity that is left.
 *
 * Defined as the negation of `resolveBoundShortcuts().enabled` on purpose: the
 * "there is nothing to click" and "there is nothing to type" states must never
 * be able to disagree.
 *
 * This is UX only. The binding minimum is enforced by kasu-backend (403
 * `AU_WHOLESALE_MINIMUM_NOT_MET`) and by the contract's own bounds; nothing
 * here may be used to relax either.
 */
export function isBelowMinimumCapacity(
    minDeposit: number,
    maxDeposit: number,
): boolean {
    return !resolveBoundShortcuts(minDeposit, maxDeposit).enabled;
}

const CENTS = 100;

/**
 * Largest whole-cent value ≤ `n`. Float multiplication can round `n * 100` UP
 * onto an integer (`1.15 * 100 === 114.99999999999999` is the usual direction,
 * but the other happens too), so the result is re-checked against `n` and
 * stepped down a cent if it overshot — the contract is "never above `n`".
 */
export function floorToCents(n: number): number {
    const k = Math.floor(n * CENTS);
    const snapped = k / CENTS;
    return snapped > n ? (k - 1) / CENTS : snapped;
}

/** Smallest whole-cent value ≥ `n`. Mirror of `floorToCents`: never below `n`. */
export function ceilToCents(n: number): number {
    const k = Math.ceil(n * CENTS);
    const snapped = k / CENTS;
    return snapped < n ? (k + 1) / CENTS : snapped;
}
