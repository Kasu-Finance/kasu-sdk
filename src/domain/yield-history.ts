/**
 * Settled interest per cycle (epoch): what a lender was credited at each close,
 * per pool and tranche, and the one formula that turns a tranche's credited
 * interest into one lender's share of it.
 *
 * **The figures are NET, and only net.** `LendingPool._applyTrancheInterest`
 * takes the performance fee off first and emits `InterestApplied` with the
 * lender side only (`interest × (1 − performanceFee)`); a fixed-term top-up
 * (`_applyFixedRateInterests`) is net of the fee the same way. So the figure
 * this module computes from those records IS what the lender was credited —
 * never take the fee off it again. No gross is offered: the subgraph keeps
 * only TODAY's fee, so a historical gross would be a guess.
 *
 * Units: amounts are display units of the DEPLOYMENT'S OWN stable token (USDC
 * on Base and XDC USDC, AUDD on XDC AUDD) — never converted to USD here;
 * shares are display units of tranche shares, as the subgraph's BigDecimals.
 */

/**
 * The largest change of a lock's shares, as a fraction of its shares before
 * the epoch, that one clearing's fixed-term top-up can make. The top-up is
 * the fixed rate's difference from the variable one on one week's balance
 * (`LendingPool._applyFixedRateInterests`) — a fraction of a percent at any
 * real rate — so 5 % is far above every genuine top-up and far below any
 * accounting fault. A lock-share change outside it is NOT interest: it is
 * left out of the yield (a share movement is never booked as yield). The one
 * seen on chain is a lock whose recorded shares were set to zero at a
 * clearing while its shares stayed in the fixed-term contract.
 */
export const MAX_TOP_UP_SHARE_FRACTION = 0.05;

/**
 * True when `sharesBefore → sharesAt` is a change one clearing's fixed-term
 * top-up can make (`MAX_TOP_UP_SHARE_FRACTION`). A lock with no shares
 * before has no top-up at all.
 */
export function isPlausibleTopUp(
    sharesBefore: number,
    sharesAt: number,
): boolean {
    if (!(sharesBefore > 0)) return sharesAt === sharesBefore;
    return (
        Math.abs(sharesAt - sharesBefore) <=
        sharesBefore * MAX_TOP_UP_SHARE_FRACTION
    );
}

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
 * earned nothing at that close), never `NaN`. So does a NEGATIVE share count:
 * the subgraph's per-lender shares are a ledger of accepted deposits and
 * withdrawals, and a wallet whose shares arrived some other way (moved to it
 * from another wallet) withdraws more than the ledger ever credited it. That
 * position is not one the ledger can describe, and its negative count is not
 * a negative yield. A lock-share change no top-up can make
 * (`isPlausibleTopUp`) contributes no top-up.
 */
export function epochTrancheYield(
    input: EpochTrancheYieldInput,
): EpochTrancheYield {
    const base =
        input.trancheShares > 0 && input.userShares > 0
            ? (input.epochInterest * input.userShares) / input.trancheShares
            : 0;

    let variable = base;
    const locks = input.locks.map((lock) => {
        if (!lock.active) return 0;

        const topUp =
            input.trancheSharesNow > 0 &&
            isPlausibleTopUp(lock.sharesBeforeEpoch, lock.sharesAtEpoch)
                ? ((lock.sharesAtEpoch - lock.sharesBeforeEpoch) *
                      input.trancheBalanceNow) /
                  input.trancheSharesNow
                : 0;

        const lockBase =
            input.userShares > 0
                ? (base * lock.sharesBeforeEpoch) / input.userShares
                : 0;

        variable -= lockBase;

        return lockBase + topUp;
    });

    const total = locks.reduce((sum, lockYield) => sum + lockYield, variable);

    return { total, variable, locks };
}

/** One lender's settled yield in one tranche at one epoch. */
export interface YieldHistoryEntry {
    /** The epoch (cycle) number, in the chain's numbering. */
    epochId: number;
    /**
     * When the epoch ended — the next epoch's start — in unix SECONDS (not
     * milliseconds).
     */
    epochEnd: number;
    /** Lowercased lending pool address. */
    poolId: string;
    /** Lowercased tranche address. */
    trancheId: string;
    /**
     * What the close credited the lender in this tranche, AFTER the
     * performance fee, in display units of the deployment's own stable token
     * (AUDD on XDC AUDD — convert before formatting it as USD).
     */
    netYield: number;
}

/** One epoch's yield summed over the entries an aggregation kept. */
export interface YieldHistoryPoint {
    /** The epoch (cycle) number. */
    epochId: number;
    /** The epoch's end, in unix SECONDS. */
    epochEnd: number;
    /** Net yield summed, in the deployment's own stable token. */
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
 * an empty input (a new lender) is an empty output.
 *
 * For a fixed-term lock holder the bars can sum to slightly MORE than the
 * lender's lifetime interest (up to about 0.2 %): each top-up is valued at the
 * tranche's CURRENT share price, which has grown since. Show "earned to date"
 * from the lifetime figure, never from this sum.
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
            point.netYield += entry.netYield;
            continue;
        }
        byEpoch.set(entry.epochId, {
            epochId: entry.epochId,
            epochEnd: entry.epochEnd,
            netYield: entry.netYield,
        });
    }

    return [...byEpoch.values()].sort((a, b) => a.epochId - b.epochId);
}
