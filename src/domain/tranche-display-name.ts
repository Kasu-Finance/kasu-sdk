import { APXIUM, getCreditOriginator, PoolNameSignal } from './partners';

// Business rename (2026-07): Apxium strategies market their top retail tranche
// as "Upper Mezzanine" — the true senior position is held by the institutional
// lender (Rixon Capital), so retail lenders are never actually senior in the
// waterfall. Display-only: subgraph/SDK tranche names, ids and any
// seniority-ranking logic keep the on-chain "Senior" name.
export const UPPER_MEZZANINE = 'Upper Mezzanine';

const SENIOR = 'senior';

/**
 * User-facing display name for a tranche. Maps `Senior` → `Upper Mezzanine`
 * on Apxium pools (identified by pool name, see `partners.ts`); every other
 * tranche/pool combination passes through unchanged.
 *
 * Call this at the view-model boundary (options, cards, transaction views),
 * NEVER in matching/sorting logic — `compareTrancheSeniority` and
 * `pickDefaultTrancheId` rank by the raw subgraph name and must keep doing so.
 * This is the one function in `domain/` that returns a user-visible string,
 * and it is here rather than in each frontend so all three cannot drift.
 *
 * `pool` accepts the raw `PoolOverview` (`poolName`), the facade `Strategy`
 * (`name`), or the name itself.
 */
export function getTrancheDisplayName(
    trancheName: string,
    pool: PoolNameSignal,
): string {
    if (trancheName.trim().toLowerCase() !== SENIOR) return trancheName;
    return getCreditOriginator(pool).name === APXIUM.name
        ? UPPER_MEZZANINE
        : trancheName;
}
