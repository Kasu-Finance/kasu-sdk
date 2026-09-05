import {
    CLEARING_WINDOW_SECONDS,
    computeSettlementWindow,
    deriveCycleDates,
    nextCycleBoundary,
} from './settlement';

/**
 * Ported from kasu-ui `src/features/portfolio/lib/settlement-window.test.ts`
 * and the non-format half of
 * `src/features/lending/lib/cycle-dates.test.ts`. The `formatCycleDate` /
 * `formatCycleCloseUtc` cases stay there — they assert printed words.
 */

const HOUR = 60 * 60;
const DAY = 24 * HOUR;
const CLEARING = 48 * HOUR;
const WEEK = 7 * DAY;

describe('computeSettlementWindow', () => {
    it('returns "unknown" when the epoch boundary is missing', () => {
        expect(
            computeSettlementWindow({
                nowSeconds: 1_000_000,
                nextEpochStart: 0,
            }),
        ).toEqual({ phase: 'unknown' });
    });

    it('returns "unknown" when the epoch boundary is stale (already elapsed)', () => {
        expect(
            computeSettlementWindow({
                nowSeconds: 1_000_000,
                nextEpochStart: 999_000,
            }),
        ).toEqual({ phase: 'unknown' });
    });

    it('counts down to the clearing window when more than 48h from epoch end', () => {
        const epochEnd = 1_700_000_000; // Thu 06:00 UTC
        const now = epochEnd - 3 * DAY; // 24h before the window opens
        const result = computeSettlementWindow({
            nowSeconds: now,
            nextEpochStart: epochEnd,
        });

        expect(result.phase).toBe('awaiting');
        if (result.phase !== 'awaiting') return;
        expect(result.nextClearingStart).toBe(epochEnd - CLEARING); // Tue 06:00
        expect(result.secondsUntilClearing).toBe(DAY);
    });

    it('reports "clearing" only inside the 48h window before epoch end', () => {
        const epochEnd = 1_700_000_000;
        const now = epochEnd - 24 * HOUR; // 24h into the window
        const result = computeSettlementWindow({
            nowSeconds: now,
            nextEpochStart: epochEnd,
        });

        expect(result.phase).toBe('clearing');
        if (result.phase !== 'clearing') return;
        expect(result.epochEnd).toBe(epochEnd);
        expect(result.secondsUntilEpochEnd).toBe(24 * HOUR);
    });

    it('flips awaiting → clearing exactly at the window boundary (T-48h)', () => {
        const epochEnd = 1_700_000_000;
        expect(
            computeSettlementWindow({
                nowSeconds: epochEnd - CLEARING - 1,
                nextEpochStart: epochEnd,
            }).phase,
        ).toBe('awaiting');
        expect(
            computeSettlementWindow({
                nowSeconds: epochEnd - CLEARING,
                nextEpochStart: epochEnd,
            }).phase,
        ).toBe('clearing');
    });

    it('respects a non-default clearing window length', () => {
        const epochEnd = 1_700_000_000;
        const now = epochEnd - 36 * HOUR;
        // 36h out is "clearing" under the default 48h window but "awaiting"
        // under a 24h one.
        expect(
            computeSettlementWindow({
                nowSeconds: now,
                nextEpochStart: epochEnd,
            }).phase,
        ).toBe('clearing');
        expect(
            computeSettlementWindow({
                nowSeconds: now,
                nextEpochStart: epochEnd,
                clearingWindowSeconds: 24 * HOUR,
            }).phase,
        ).toBe('awaiting');
    });
});

describe('nextCycleBoundary', () => {
    const epochEnd = 1_700_000_000;
    const clearingStart = epochEnd - CLEARING;

    it('returns the cycle close while the window is still ahead', () => {
        expect(nextCycleBoundary(epochEnd, epochEnd - 3 * DAY)).toBe(
            clearingStart,
        );
    });

    it('returns the epoch end once inside the clearing window', () => {
        expect(nextCycleBoundary(epochEnd, clearingStart + 1)).toBe(epochEnd);
    });

    it('hands over from close to epoch end exactly at the boundary instant', () => {
        // At T-48h the close has just been reached, so the next thing to wait
        // for is the epoch end — not the instant we are standing on.
        expect(nextCycleBoundary(epochEnd, clearingStart - 1)).toBe(
            clearingStart,
        );
        expect(nextCycleBoundary(epochEnd, clearingStart)).toBe(epochEnd);
    });

    it('returns undefined when there is nothing left to wait for', () => {
        expect(nextCycleBoundary(epochEnd, epochEnd)).toBeUndefined(); // elapsed
        expect(nextCycleBoundary(epochEnd, epochEnd + DAY)).toBeUndefined(); // stale
        expect(nextCycleBoundary(undefined, epochEnd - DAY)).toBeUndefined(); // not loaded
        expect(nextCycleBoundary(0, epochEnd - DAY)).toBeUndefined(); // sentinel zero
    });

    it('agrees with computeSettlementWindow about where the window opens', () => {
        // One number, two consumers: the phase machine and the timer helper
        // must never disagree about when the cycle turns.
        expect(CLEARING_WINDOW_SECONDS).toBe(CLEARING);
        const justInside = nextCycleBoundary(epochEnd, clearingStart);
        expect(
            computeSettlementWindow({
                nowSeconds: clearingStart,
                nextEpochStart: epochEnd,
            }).phase,
        ).toBe('clearing');
        expect(justInside).toBe(epochEnd);
    });

    it('respects a non-default clearing window length', () => {
        const now = epochEnd - 36 * HOUR;
        // 36h out: inside a 48h window (next stop is the epoch end), still
        // ahead of a 24h one (next stop is that window opening).
        expect(nextCycleBoundary(epochEnd, now)).toBe(epochEnd);
        expect(nextCycleBoundary(epochEnd, now, 24 * HOUR)).toBe(
            epochEnd - 24 * HOUR,
        );
    });
});

describe('deriveCycleDates', () => {
    // Fixture: epoch end = Thu 6 Aug 2026, 06:00 UTC.
    const EPOCH_END = Date.UTC(2026, 7, 6, 6, 0, 0) / 1000; // 1785996000
    const CLOSE = EPOCH_END - CLEARING; // Tue 4 Aug 06:00 UTC

    it('returns close = epochEnd − 48h and outcome = epochEnd before the window opens', () => {
        const now = Date.UTC(2026, 7, 1, 12, 0, 0) / 1000; // Sat 1 Aug
        expect(deriveCycleDates(EPOCH_END, now)).toEqual({
            close: CLOSE,
            outcome: EPOCH_END,
        });
    });

    it('advances to the next weekly cycle when the request lands inside the clearing window', () => {
        // now is Wed 5 Aug 00:00 — inside [close, epochEnd): this cycle has
        // already closed, so the request queues for next week.
        const now = Date.UTC(2026, 7, 5, 0, 0, 0) / 1000;
        expect(deriveCycleDates(EPOCH_END, now)).toEqual({
            close: CLOSE + WEEK,
            outcome: EPOCH_END + WEEK,
        });
    });

    it('returns null when the epoch boundary is missing', () => {
        expect(deriveCycleDates(undefined, EPOCH_END - WEEK)).toBeNull();
        expect(deriveCycleDates(0, EPOCH_END - WEEK)).toBeNull();
    });

    it('returns null when the epoch boundary is stale (already elapsed)', () => {
        expect(deriveCycleDates(EPOCH_END, EPOCH_END + 60)).toBeNull();
    });

    it('runs on the same window constant as the phase machine', () => {
        const now = Date.UTC(2026, 7, 1, 12, 0, 0) / 1000;
        const dates = deriveCycleDates(EPOCH_END, now);
        expect(dates?.outcome).toBe(
            (dates?.close ?? 0) + CLEARING_WINDOW_SECONDS,
        );
    });
});
