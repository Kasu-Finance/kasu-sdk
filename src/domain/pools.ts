import { PoolOverview, TrancheData } from '../services/DataService/types';

import { netEffectiveApy } from './rates';
import { trancheHasCapacity } from './tranches';

/**
 * The highest FTD-inclusive upper bound across a pool's tranches, or `0` when
 * none is usable. The sort key behind `selectVisiblePools`.
 */
export function poolMaxApy(pool: PoolOverview): number {
    let hi = 0;
    for (const t of pool.tranches) {
        const v = parseFloat(t.maxApy);
        if (Number.isFinite(v) && v > hi) hi = v;
    }
    return hi;
}

/**
 * A lending grid's visible pool set: *active* and *not yet oversubscribed*
 * pools, sorted with has-capacity strategies first, then by highest max APY.
 *
 * Shared so a server-rendered payload and a client re-fetch can never
 * disagree — kasu-ui's SSR fetcher and client hook used to carry verbatim
 * copies of this filter + sort, and any drift surfaced as an SSR→CSR content
 * flip on the lending page.
 *
 * Pure: operates on a fresh array (`filter` output), so the in-place `sort`
 * does not mutate the caller's input.
 */
export function selectVisiblePools(all: PoolOverview[]): PoolOverview[] {
    const active = all.filter((p) => p.isActive && !p.isOversubscribed);
    return active.sort((a, b) => {
        const aHas = a.tranches.some(trancheHasCapacity) ? 1 : 0;
        const bHas = b.tranches.some(trancheHasCapacity) ? 1 : 0;
        if (aHas !== bHas) return bHas - aHas;
        return poolMaxApy(b) - poolMaxApy(a);
    });
}

// `tranches` is typed as a required array but arrives from the subgraph, so
// both scanners below read it as possibly missing — a pool with no tranche
// list contributes nothing instead of throwing. Mirrors the `?? []` the
// kasu-ui originals carried.
function tranchesOf(tranches: TrancheData[] | undefined): TrancheData[] {
    return tranches ?? [];
}

export interface BestTranche {
    pool: PoolOverview;
    tranche: TrancheData;
    /** Base variable-rate APY as a decimal fraction (e.g. `0.12`). */
    apy: number;
}

/**
 * The highest-yielding tranche that still has capacity, across all pools.
 *
 * Compares `tranche.apy` — the base variable rate — NOT `minApy`/`maxApy`,
 * which the data service widens with fixed-term-deposit variants. A headline
 * naming one tranche should advertise the rate every depositor gets, not an
 * FTD-locked uplift.
 *
 * Capacity is gated by the shared `trancheHasCapacity` (≥ 1 stable unit), so
 * full tranches never win. Ties on APY break toward more remaining capacity.
 * Returns `null` when no tranche qualifies (empty list, all full, or all rates
 * unset) — callers fall back to static copy.
 */
export function pickHighestYieldTranche(
    pools?: PoolOverview[] | null,
): BestTranche | null {
    if (!pools?.length) return null;

    let best: BestTranche | null = null;

    for (const pool of pools) {
        for (const tranche of tranchesOf(pool.tranches)) {
            if (!trancheHasCapacity(tranche)) continue;

            const apy = parseFloat(tranche.apy);
            if (!Number.isFinite(apy) || apy <= 0) continue;

            if (!best) {
                best = { pool, tranche, apy };
                continue;
            }

            const capacity = parseFloat(tranche.poolCapacity);
            const bestCapacity = parseFloat(best.tranche.poolCapacity);
            if (apy > best.apy || (apy === best.apy && capacity > bestCapacity)) {
                best = { pool, tranche, apy };
            }
        }
    }

    return best;
}

/**
 * The highest NET Effective Interest Rate on offer across the pools passed in
 * — the ceiling behind an "up to …" claim. The numeric core of kasu-ui's
 * `formatMaxNetRate`.
 *
 * `null` when there is nothing to quote, and callers must then DROP the claim
 * rather than print a placeholder: this feeds text that gets posted publicly.
 *
 * Scope follows the caller's pool list, which is normally keyed to one chain —
 * so a lender on XDC AUDD quotes the AUDD ceiling, not Base's. That is the
 * intended reading: they are sharing the deployment they are on.
 *
 * Reads `maxApy` — the FTD-inclusive upper bound — unlike
 * `pickHighestYieldTranche` above, which names one tranche's variable rate. A
 * ceiling claim and a specific tranche's rate are different statements, and
 * the ceiling must agree with the top of `netTrancheApyBounds`, which reads
 * the same field. `apy` is taken into the comparison too: `maxApy` is derived
 * from the base rate plus any fixed-term configs, so it can never be lower,
 * and a tranche that carries no `maxApy` at all still contributes its base
 * rate instead of dropping out.
 *
 * Capacity-gated by `trancheHasCapacity` — we never advertise a rate no lender
 * could take up.
 *
 * FAIL CLOSED: an out-of-domain fee, or a net rate that is non-finite or ≤ 0,
 * returns `null`. The gross figure is never a substitute, and a caller that
 * does not yet know the fee must not pass `0`.
 *
 * @param feePercent the chain's performance fee, 0..100 — never a fraction.
 */
export function maxNetRateCeiling(
    pools: PoolOverview[] | undefined | null,
    feePercent: number,
): number | null {
    if (!pools?.length) return null;

    let ceiling = 0;
    for (const pool of pools) {
        for (const tranche of tranchesOf(pool.tranches)) {
            if (!trancheHasCapacity(tranche)) continue;
            for (const raw of [tranche.maxApy, tranche.apy]) {
                const apy = parseFloat(raw);
                if (Number.isFinite(apy) && apy > ceiling) ceiling = apy;
            }
        }
    }
    if (ceiling <= 0) return null;

    const rate = netEffectiveApy(ceiling, feePercent);
    if (!Number.isFinite(rate) || rate <= 0) return null;
    return rate;
}
