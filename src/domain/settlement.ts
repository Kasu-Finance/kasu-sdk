/**
 * Cycles and the clearing window — the protocol's weekly clock, as numbers.
 *
 * Lifted verbatim from kasu-ui's `features/portfolio/lib/settlement-window.ts`
 * and `features/lending/lib/cycle-dates.ts`. The two formatters that live
 * beside `deriveCycleDates` there (`formatCycleDate`, `formatCycleCloseUtc`)
 * print words and stay in the applications; everything here is unix seconds in
 * and unix seconds out.
 *
 * The clearing window is the fixed 48 hours immediately preceding an epoch
 * end. Inside it, pending requests are being processed and cannot be modified,
 * and the countdown runs to the epoch end. Outside it, the countdown runs to
 * the next clearing-window start.
 *
 * The epoch end comes straight from the chain (`nextEpochStartTimestamp`, i.e.
 * the SDK's `getNextEpochDate`) — the same value the protocol's own
 * `getNextClearingPeriodDate` derives from — so the window always lines up
 * with the real weekly schedule (Tue 06:00 → Thu 06:00 UTC on Base) instead of
 * a projected subgraph timestamp that can drift off the grid.
 */

/**
 * Clearing-window length — a fixed 48h protocol constant. Exported so every
 * consumer derives the window from the same number this module runs on.
 */
export const CLEARING_WINDOW_SECONDS = 48 * 60 * 60;

/**
 * Weekly cadence — the epoch schedule is fixed weekly (Tue → Thu UTC on Base).
 * Used only to roll a cycle forward when a request lands inside a window that
 * has already closed.
 */
const WEEK_SECONDS = 7 * 24 * 60 * 60;

export type SettlementWindowState =
    | {
          phase: 'awaiting';
          secondsUntilClearing: number;
          nextClearingStart: number;
      }
    | { phase: 'clearing'; secondsUntilEpochEnd: number; epochEnd: number }
    | { phase: 'unknown' };

export interface SettlementWindowInput {
    /** Now, in unix seconds. */
    nowSeconds: number;
    /**
     * Authoritative epoch end, in unix seconds — the chain's
     * `nextEpochStartTimestamp` (SDK `getNextEpochDate`). During an epoch this
     * is in the future; it refetches to the next boundary once it rolls.
     */
    nextEpochStart: number;
    /** Clearing-window length; defaults to the 48h protocol constant. */
    clearingWindowSeconds?: number;
}

/**
 * Which phase of the weekly cycle `nowSeconds` falls in, and how long is left
 * of it.
 *
 * `'unknown'` when no epoch boundary has been loaded yet, or when the one on
 * hand is stale (it has already elapsed — the on-chain value refetches to the
 * next boundary shortly after rollover). A caller must render its "no cycle
 * loaded" state there, never a zeroed countdown.
 */
export function computeSettlementWindow({
    nowSeconds,
    nextEpochStart,
    clearingWindowSeconds = CLEARING_WINDOW_SECONDS,
}: SettlementWindowInput): SettlementWindowState {
    // No epoch boundary loaded yet, or a stale one that already elapsed.
    if (nextEpochStart <= 0 || nextEpochStart <= nowSeconds) {
        return { phase: 'unknown' };
    }

    const clearingStart = nextEpochStart - clearingWindowSeconds;

    if (nowSeconds < clearingStart) {
        return {
            phase: 'awaiting',
            secondsUntilClearing: clearingStart - nowSeconds,
            nextClearingStart: clearingStart,
        };
    }

    // nowSeconds is in [clearingStart, nextEpochStart) — inside the window.
    return {
        phase: 'clearing',
        secondsUntilEpochEnd: nextEpochStart - nowSeconds,
        epochEnd: nextEpochStart,
    };
}

/**
 * The next cycle boundary strictly after `nowSeconds`, in unix seconds — the
 * cycle close (`nextEpochStart − 48h`) while the window is still open, the
 * epoch end once we are inside it.
 *
 * `undefined` when there is no boundary left to wait for: no epoch boundary
 * loaded, or a cached one that has already elapsed — the same staleness rule
 * `computeSettlementWindow` applies before it reports `'unknown'`.
 *
 * Split out of the state machine because some consumers need the INSTANT
 * rather than the phase: one to flush the cycle-dependent caches when the
 * clock crosses it, one to move a pre-commit screen's snapshot clock at the
 * same moment.
 */
export function nextCycleBoundary(
    nextEpochStart: number | undefined,
    nowSeconds: number,
    clearingWindowSeconds: number = CLEARING_WINDOW_SECONDS,
): number | undefined {
    if (!nextEpochStart || nextEpochStart <= 0) return undefined;
    const clearingStart = nextEpochStart - clearingWindowSeconds;
    if (nowSeconds < clearingStart) return clearingStart;
    if (nowSeconds < nextEpochStart) return nextEpochStart;
    return undefined;
}

export interface CycleDates {
    /** Unix seconds — the next cycle close (clearing-window start). */
    close: number;
    /** Unix seconds — the outcome-confirmed-by boundary (close + 48h). */
    outcome: number;
}

/**
 * The cycle-close and outcome dates for a request submitted `now`.
 *
 * - The cycle "closes" (stops accepting requests, starts processing) at the
 *   start of the 48h clearing window, i.e. 48h before the epoch end.
 * - Processing takes up to 48h, so the outcome is confirmed by the epoch end
 *   (close + 48h).
 *
 * Returns `null` when the epoch boundary is not available or is stale — a
 * caller then omits the dates entirely (omit, don't stub).
 *
 * The common case is a request submitted OUTSIDE the clearing window: the
 * close is `nextEpochStart − 48h` and the outcome is `nextEpochStart`. When
 * the request lands INSIDE the current clearing window (that close is already
 * in the past), it queues for the NEXT weekly cycle, so the close is advanced
 * by whole weeks until it is in the future.
 */
export function deriveCycleDates(
    nextEpochStart: number | undefined,
    nowSeconds: number,
): CycleDates | null {
    // No boundary loaded, or a stale one that already elapsed — the same
    // staleness rule as `computeSettlementWindow`.
    if (!nextEpochStart || nextEpochStart <= nowSeconds) return null;

    let close = nextEpochStart - CLEARING_WINDOW_SECONDS;
    let outcome = nextEpochStart;
    // Inside the current clearing window the close already passed; a request
    // now is queued for the next weekly cycle.
    while (close <= nowSeconds) {
        close += WEEK_SECONDS;
        outcome += WEEK_SECONDS;
    }
    return { close, outcome };
}
