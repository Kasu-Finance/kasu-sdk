/**
 * Settled interest per cycle (epoch): what a lender was credited at each close,
 * per pool and tranche, and the one formula that turns a tranche's credited
 * interest into one lender's share of it.
 *
 * **The subgraph's interest is already NET.** `LendingPool._applyTrancheInterest`
 * takes the performance fee off first and emits `InterestApplied` with the
 * lender side only (`interest × (1 − performanceFee)`); a fixed-term top-up
 * (`_applyFixedRateInterests`) is net of the fee the same way. So the figure
 * this module computes from those records IS the net yield, and the gross is
 * DERIVED from it through the same identity the forward-looking figures in
 * `yields.ts` use (`net = gross × (1 − feePercent / 100)`), never the other way
 * round: taking the fee off a figure the chain had already taken it off would
 * under-report what the lender earned.
 *
 * Units: amounts and shares are display units of the deployment's stable asset
 * and of tranche shares, as the subgraph's BigDecimals; `feePercent` is a
 * PERCENTAGE IN 0..100.
 */

import { isUsableFeePercent } from './yields';

/** One fixed-term lock inside a tranche position, at one epoch. */
export interface EpochLockShares {
    /**
     * The lock earns in this epoch: it started BEFORE the epoch, ends at or
     * after it, and the lender has a share snapshot for the tranche at it.
     */
    active: boolean;
    /** The lock's tranche shares as of the epoch (latest update at or before it). */
    sharesAtEpoch: number;
    /** The lock's tranche shares as of the epoch BEFORE it. */
    sharesBeforeEpoch: number;
}

/** Everything one lender's share of one tranche's credited interest needs. */
export interface EpochTrancheYieldInput {
    /** The tranche's interest credited at this epoch's close (net of the fee). */
    epochInterest: number;
    /** The lender's tranche shares as of the epoch (fixed-term locks included). */
    userShares: number;
    /** The tranche's total shares as of the epoch. */
    trancheShares: number;
    /**
     * The tranche's CURRENT balance and shares: the price a fixed-term top-up
     * (extra shares) is valued at. The subgraph keeps no per-epoch tranche
     * balance, so an older top-up is valued at today's price — a second-order
     * difference, because the top-up is only the fixed rate's excess over the
     * variable one.
     */
    trancheBalanceNow: number;
    trancheSharesNow: number;
    locks: readonly EpochLockShares[];
}

export interface EpochTrancheYield {
    /** `variable + Σ locks` — the lender's whole yield in the tranche. */
    total: number;
    /** The variable residual: the share-weighted base yield minus the locks' part of it. */
    variable: number;
    /** Each lock's yield, in the order of `input.locks`: its base part plus its top-up. */
    locks: number[];
}

/**
 * The ONE per-epoch formula. `Portfolio.getPortfolioLendingData` runs it for
 * the last settled epoch and `getYieldHistory` for every epoch of a window, so
 * the two figures cannot drift apart.
 *
 * ```
 * base     = epochInterest × userShares / trancheShares
 * lockBase = base × lock.sharesBeforeEpoch / userShares          (active locks)
 * topUp    = (lock.sharesAtEpoch − lock.sharesBeforeEpoch) × trancheBalanceNow / trancheSharesNow
 * variable = base − Σ lockBase
 * total    = variable + Σ (lockBase + topUp)
 * ```
 *
 * A zero denominator contributes 0 (a tranche or a lender with no shares
 * earned nothing at that close), never `NaN`.
 */
export function epochTrancheYield(
    input: EpochTrancheYieldInput,
): EpochTrancheYield {
    const base =
        input.trancheShares === 0
            ? 0
            : (input.epochInterest * input.userShares) / input.trancheShares;

    let variable = base;
    const locks = input.locks.map((lock) => {
        if (!lock.active) return 0;

        const topUp =
            input.trancheSharesNow === 0
                ? 0
                : ((lock.sharesAtEpoch - lock.sharesBeforeEpoch) *
                      input.trancheBalanceNow) /
                  input.trancheSharesNow;

        const lockBase =
            input.userShares === 0
                ? 0
                : (base * lock.sharesBeforeEpoch) / input.userShares;

        variable -= lockBase;

        return lockBase + topUp;
    });

    const total = locks.reduce((sum, lockYield) => sum + lockYield, variable);

    return { total, variable, locks };
}

/**
 * The gross figure behind a NET one: `net / (1 − feePercent / 100)`, the
 * inverse of the identity `weeklyInterest` applies.
 *
 * FAILS CLOSED with `NaN` — an unknown, non-finite or out-of-domain fee, a
 * 100 % fee (no gross recoverable from a zero net), or a non-finite net.
 */
export function grossYieldFromNet(
    netYield: number,
    feePercent: number | null,
): number {
    if (!Number.isFinite(netYield)) return NaN;
    if (!isUsableFeePercent(feePercent) || feePercent === 100) return NaN;
    return netYield / (1 - feePercent / 100);
}

/** One lender's settled yield in one tranche at one epoch. */
export interface YieldHistoryEntry {
    /** The epoch (cycle) number. */
    epochId: number;
    /** When the epoch ended — the next epoch's start — in unix SECONDS. */
    epochEnd: number;
    /** Lowercased lending pool address. */
    poolId: string;
    /** Lowercased tranche address. */
    trancheId: string;
    /**
     * Before the performance fee, derived from `netYield` with the CURRENT fee
     * (the subgraph keeps no fee history). `NaN` when the fee is unknown.
     */
    grossYield: number;
    /** What the chain credited the lender, after the fee. */
    netYield: number;
}

/** One epoch's yield summed over the entries an aggregation kept. */
export interface YieldHistoryPoint {
    epochId: number;
    epochEnd: number;
    grossYield: number;
    netYield: number;
}

export interface YieldHistoryFilter {
    /** Keep only this pool (case-insensitive). */
    poolId?: string;
    /** Keep only this tranche (case-insensitive). */
    trancheId?: string;
}

/**
 * Pool/tranche entries → one point per epoch, ascending by `epochId`. With no
 * filter it sums every strategy (the Lend tab's bars); with `poolId` it is one
 * strategy (a strategy page's bars).
 *
 * An epoch appears only if a kept entry has it — there is no zero padding, so
 * an empty input (a new lender) is an empty output. A `NaN` gross in any kept
 * entry makes that epoch's gross `NaN`: a partial gross is a wrong number.
 */
export function aggregateYieldHistory(
    entries: readonly YieldHistoryEntry[],
    filter: YieldHistoryFilter = {},
): YieldHistoryPoint[] {
    const poolId = filter.poolId?.toLowerCase();
    const trancheId = filter.trancheId?.toLowerCase();
    const byEpoch = new Map<number, YieldHistoryPoint>();

    for (const entry of entries) {
        if (poolId !== undefined && entry.poolId.toLowerCase() !== poolId) {
            continue;
        }
        if (
            trancheId !== undefined &&
            entry.trancheId.toLowerCase() !== trancheId
        ) {
            continue;
        }

        const point = byEpoch.get(entry.epochId);
        if (point) {
            point.grossYield += entry.grossYield;
            point.netYield += entry.netYield;
            continue;
        }
        byEpoch.set(entry.epochId, {
            epochId: entry.epochId,
            epochEnd: entry.epochEnd,
            grossYield: entry.grossYield,
            netYield: entry.netYield,
        });
    }

    return [...byEpoch.values()].sort((a, b) => a.epochId - b.epochId);
}
