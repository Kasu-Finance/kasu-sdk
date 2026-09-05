import { PoolOverview, TrancheData } from '../services/DataService/types';

import { netEffectiveApy } from './rates';

/**
 * Minimum remaining capacity (in stable-asset units) for a tranche to be
 * selectable. Mirrors `MIN_CAPACITY = toBigNumber('1')` in kasu-fe-next's
 * lending modal after its `formatEther`. Anything below this is rounding
 * noise — the SDK's own capacity arithmetic routinely leaves sub-cent dust
 * behind.
 */
export const MIN_TRANCHE_CAPACITY = 1;

/**
 * Remaining capacity as it reaches this layer. `TrancheData` (raw, from the
 * data service) calls it `poolCapacity`; the facade's `StrategyTranche` calls
 * the same number `availableCapacity`. Accepting both keeps ONE capacity gate
 * for the whole SDK rather than a duplicate per shape.
 */
export type TrancheCapacitySignal =
    | { poolCapacity: string }
    | { availableCapacity: string };

export function trancheHasCapacity(tranche: TrancheCapacitySignal): boolean {
    const raw =
        'poolCapacity' in tranche
            ? tranche.poolCapacity
            : tranche.availableCapacity;
    const remaining = parseFloat(raw);
    return Number.isFinite(remaining) && remaining >= MIN_TRANCHE_CAPACITY;
}

/**
 * Whole-strategy capacity gate: true when the pool has tranches but none of
 * them has remaining capacity. Drives a lend form's full-capacity message and
 * its step-counter suppression.
 */
export function poolAllTranchesFull(pool: PoolOverview): boolean {
    return pool.tranches.length > 0 && !pool.tranches.some(trancheHasCapacity);
}

export type PoolStatus = 'Live' | 'Full' | 'Coming soon';

/**
 * The status CODE for a pool. A code, not copy: consumers map it to their own
 * wording and locale.
 */
export function derivePoolStatus(pool: PoolOverview): PoolStatus {
    if (!pool.enabled) return 'Coming soon';
    if (poolAllTranchesFull(pool)) return 'Full';
    return 'Live';
}

/**
 * Seniority rank of a tranche by name — LOWER is less risky. The credit
 * waterfall is Senior (repaid first, lowest risk) → Mezzanine → Junior
 * (repaid last, highest risk). APY is NOT a reliable proxy (a pool can price
 * its Senior tranche above its Mezzanine), so risk is ranked by name.
 * Unrecognised names sort last, so a known-safe tranche always wins the
 * default. Ranks by the RAW subgraph name — the Apxium "Upper Mezzanine"
 * rename is display-only and must never reach here (see
 * `tranche-display-name.ts`).
 */
const TRANCHE_RISK_RANK: Record<string, number | undefined> = {
    senior: 0,
    mezzanine: 1,
    junior: 2,
};

// `name` is typed `string` on `TrancheData` but arrives from the subgraph, so
// it is taken as possibly missing here: an unnamed tranche ranks last rather
// than throwing on `.trim()`.
function riskRankOfName(name: string | undefined): number {
    return (
        TRANCHE_RISK_RANK[name?.trim().toLowerCase() ?? ''] ??
        Number.POSITIVE_INFINITY
    );
}

export function trancheRiskRank(tranche: TrancheData): number {
    return riskRankOfName(tranche.name);
}

/**
 * Comparator that orders tranches SAFEST-FIRST (Senior → Mezzanine → Junior)
 * by the same name-based risk rank the default-pick uses. Ranks by the RAW
 * subgraph name, so the Apxium "Upper Mezzanine" display rename never reaches
 * here. Ties (incl. unrecognised names, which both rank last) keep their input
 * order under a stable sort. Used by a lend dropdown to list the least-risky
 * option first.
 */
export function compareTrancheSeniority(a: TrancheData, b: TrancheData): number {
    const ra = trancheRiskRank(a);
    const rb = trancheRiskRank(b);
    if (ra === rb) return 0;
    return ra < rb ? -1 : 1;
}

/**
 * Capacity-aware default tranche pick: the LOWEST-risk tranche that still has
 * capacity, so a new lender lands on the safest available option. Riskier
 * tranches remain a deliberate opt-in — we must never pre-select the
 * highest-risk Junior (audit 3.2). When every tranche is full we fall back to
 * the lowest-risk one regardless, so a form still mounts in a known state
 * (the dropdown marks it full and the submit gate blocks progress).
 */
export function pickDefaultTrancheId(pool: PoolOverview): string {
    const withCapacity = pool.tranches.filter(trancheHasCapacity);
    const candidates = withCapacity.length > 0 ? withCapacity : pool.tranches;
    if (candidates.length === 0) return '';
    return candidates.reduce((best, t) =>
        trancheRiskRank(t) < trancheRiskRank(best) ? t : best,
    ).id;
}

/** A closed APY range, both bounds as 0..1 fractions. */
export interface ApyBounds {
    min: number;
    max: number;
}

/**
 * GROSS APY range across a pool's tranches — the numeric core of kasu-ui's
 * `formatTrancheApyRange`. Each `TrancheData` carries `minApy`/`maxApy`
 * derived from the base rate plus any fixed-term configs (`data-service.ts`).
 *
 * Zero and negative values are skipped — an unset/missing rate (e.g. a tranche
 * with no fixed-term config) must not drag the range down to `0–10.5%`.
 * `null` when nothing usable remains, which is the caller's cue to render its
 * "no rate" state rather than a confident zero.
 *
 * The min is taken over `minApy` and the max over `maxApy`, so a single
 * unusable side collapses the whole range to `null` rather than half a range.
 *
 * Formatting is NOT here. The rule that two bounds printing the same figure
 * collapse to one is decided on the rendered digits, so it belongs with the
 * formatter that produces them (kasu-ui `format-tranche-apy.ts`).
 */
export function trancheApyBounds(tranches: TrancheData[]): ApyBounds | null {
    if (tranches.length === 0) return null;
    let lo = Number.POSITIVE_INFINITY;
    let hi = Number.NEGATIVE_INFINITY;
    for (const t of tranches) {
        const min = parseFloat(t.minApy);
        const max = parseFloat(t.maxApy);
        if (Number.isFinite(min) && min > 0) lo = Math.min(lo, min);
        if (Number.isFinite(max) && max > 0) hi = Math.max(hi, max);
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
    return { min: lo, max: hi };
}

/**
 * The same range as NET Effective Interest Rates — each bound through
 * `netEffectiveApy`.
 *
 * FAIL CLOSED: `null` when either bound comes back non-finite or ≤ 0, so an
 * out-of-domain fee or a rate-less pool can never be rendered as a confident
 * figure. A caller that does not yet know the fee must not substitute `0` —
 * a fee-less rate overstates the figure by up to 3.4pp with nothing on screen
 * saying so; it should skip the call and render its unavailable state.
 *
 * @param feePercent the chain's performance fee, 0..100 — never a fraction.
 *   See `netEffectiveApy` for why the units matter.
 */
export function netTrancheApyBounds(
    tranches: TrancheData[],
    feePercent: number,
): ApyBounds | null {
    const gross = trancheApyBounds(tranches);
    if (!gross) return null;
    const min = netEffectiveApy(gross.min, feePercent);
    const max = netEffectiveApy(gross.max, feePercent);
    if (!Number.isFinite(min) || min <= 0) return null;
    if (!Number.isFinite(max) || max <= 0) return null;
    return { min, max };
}
