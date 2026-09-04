import * as fc from 'fast-check';

import { TrancheData } from '../services/DataService/types';

import {
    ceilToCents,
    floorToCents,
    isBelowMinimumCapacity,
    MAX_LENDING_AMOUNT_FALLBACK,
    MIN_LENDING_AMOUNT_FALLBACK,
    parseTrancheBound,
    resolveBoundShortcuts,
    resolveDepositBounds,
} from './deposit-bounds';

/**
 * Ported from kasu-ui `src/features/lending/lib/tranche-bounds.property.test.ts`,
 * with the `resolveDepositBounds` / `parseTrancheBound` cases the property file
 * did not cover.
 *
 * The Min/Max shortcuts (clickable bound labels on a lend form) must never
 * write an amount the form rejects, so the snapping is checked as invariants
 * over the whole input domain rather than at a few hand-picked values.
 */

function tranche(over: Partial<TrancheData>): TrancheData {
    return {
        minimumDeposit: '500',
        maximumDeposit: '500000',
        poolCapacity: '250000',
        ...over,
    } as unknown as TrancheData;
}

const amountArb = fc.double({
    min: 0,
    max: 1e12,
    noNaN: true,
    noDefaultInfinity: true,
});
/** `String(k / 100)` prints at most two decimals for any integer `k` in range. */
const AT_MOST_TWO_DP = /^\d+(\.\d{1,2})?$/;

describe('parseTrancheBound', () => {
    it('accepts a positive finite bound from a string or a number', () => {
        expect(parseTrancheBound('500')).toBe(500);
        expect(parseTrancheBound(500)).toBe(500);
    });

    it('rejects anything that is not a usable bound', () => {
        expect(parseTrancheBound(null)).toBeNull();
        expect(parseTrancheBound(undefined)).toBeNull();
        expect(parseTrancheBound('')).toBeNull();
        expect(parseTrancheBound('0')).toBeNull();
        expect(parseTrancheBound('-1')).toBeNull();
        expect(parseTrancheBound('not-a-number')).toBeNull();
        expect(parseTrancheBound(Infinity)).toBeNull();
    });
});

describe('resolveDepositBounds', () => {
    it('clamps the max by the tranche’s REMAINING capacity', () => {
        // A tranche can fill mid-epoch while `maximumDeposit` stays put.
        expect(
            resolveDepositBounds(
                tranche({ maximumDeposit: '500000', poolCapacity: '25285.86' }),
            ),
        ).toEqual({ minDeposit: 500, maxDeposit: 25285.86 });
    });

    it('keeps the configured max when capacity is larger', () => {
        expect(
            resolveDepositBounds(
                tranche({ maximumDeposit: '500000', poolCapacity: '900000' }),
            ),
        ).toEqual({ minDeposit: 500, maxDeposit: 500000 });
    });

    it('falls back when a "coming soon" pool has no bounds configured', () => {
        expect(
            resolveDepositBounds(
                tranche({
                    minimumDeposit: '0',
                    maximumDeposit: '0',
                    poolCapacity: '900000',
                }),
            ),
        ).toEqual({
            minDeposit: MIN_LENDING_AMOUNT_FALLBACK,
            maxDeposit: MAX_LENDING_AMOUNT_FALLBACK,
        });
    });

    it('uses both fallbacks and skips the capacity clamp with no tranche at all', () => {
        expect(resolveDepositBounds(undefined)).toEqual({
            minDeposit: MIN_LENDING_AMOUNT_FALLBACK,
            maxDeposit: MAX_LENDING_AMOUNT_FALLBACK,
        });
    });

    it('treats unparseable or negative capacity as zero', () => {
        expect(
            resolveDepositBounds(tranche({ poolCapacity: 'not-a-number' }))
                .maxDeposit,
        ).toBe(0);
        expect(
            resolveDepositBounds(tranche({ poolCapacity: '-5' })).maxDeposit,
        ).toBe(0);
    });
});

describe('cent snapping', () => {
    it('floorToCents never exceeds its input, stays within a cent of it, and has ≤ 2dp', () => {
        fc.assert(
            fc.property(amountArb, (n) => {
                const snapped = floorToCents(n);
                expect(snapped).toBeLessThanOrEqual(n);
                expect(n - snapped).toBeLessThan(0.02);
                expect(String(snapped)).toMatch(AT_MOST_TWO_DP);
            }),
        );
    });

    it('ceilToCents never undershoots its input, stays within a cent of it, and has ≤ 2dp', () => {
        fc.assert(
            fc.property(amountArb, (n) => {
                const snapped = ceilToCents(n);
                expect(snapped).toBeGreaterThanOrEqual(n);
                expect(snapped - n).toBeLessThan(0.02);
                expect(String(snapped)).toMatch(AT_MOST_TWO_DP);
            }),
        );
    });
});

describe('resolveBoundShortcuts', () => {
    it('keeps both shortcuts inside the validated range whenever they are enabled', () => {
        fc.assert(
            fc.property(amountArb, amountArb, (minDeposit, maxDeposit) => {
                const { min, max, enabled } = resolveBoundShortcuts(
                    minDeposit,
                    maxDeposit,
                );
                if (!enabled) return;
                expect(min).toBeGreaterThanOrEqual(minDeposit);
                expect(max).toBeLessThanOrEqual(maxDeposit);
                expect(max).toBeGreaterThanOrEqual(min);
                expect(max).toBeGreaterThan(0);
            }),
        );
    });

    it('disables the pair whenever the snapped range is empty', () => {
        // Tranche at capacity (max clamps to 0), sub-cent dust the SDK's float
        // subtraction leaves behind, remaining capacity below the tranche
        // minimum, and an AU floor above the capacity.
        expect(resolveBoundShortcuts(500, 0).enabled).toBe(false);
        expect(
            resolveBoundShortcuts(500, 1.4551915228366852e-11).enabled,
        ).toBe(false);
        expect(resolveBoundShortcuts(500, 137).enabled).toBe(false);
        expect(resolveBoundShortcuts(240_000, 100_000).enabled).toBe(false);
    });

    it('snaps SDK float noise onto cents without crossing the bound', () => {
        expect(resolveBoundShortcuts(500, 249999.99999999997)).toEqual({
            min: 500,
            max: 249999.99,
            enabled: true,
        });
        expect(resolveBoundShortcuts(500, 25285.86)).toEqual({
            min: 500,
            max: 25285.86,
            enabled: true,
        });
        // An AU remainder with more precision than the field shows rounds UP.
        expect(resolveBoundShortcuts(358765.432109, 500_000).min).toBe(
            358765.44,
        );
    });
});

describe('isBelowMinimumCapacity', () => {
    it('is exactly the negation of the shortcuts being enabled', () => {
        fc.assert(
            fc.property(amountArb, amountArb, (minDeposit, maxDeposit) => {
                // The "nothing to click" and "nothing to type" states must
                // never be able to disagree.
                expect(isBelowMinimumCapacity(minDeposit, maxDeposit)).toBe(
                    !resolveBoundShortcuts(minDeposit, maxDeposit).enabled,
                );
            }),
        );
    });

    it('flags a capacity that has fallen under the tranche minimum', () => {
        expect(isBelowMinimumCapacity(500, 137)).toBe(true);
        expect(isBelowMinimumCapacity(500, 25285.86)).toBe(false);
    });
});
