import * as fc from 'fast-check';

import {
    aggregateYieldHistory,
    epochTrancheYield,
    EpochTrancheYieldInput,
    grossYieldFromNet,
    YieldHistoryEntry,
} from './yield-history';
import { weeklyInterest } from './yields';

const POOL_A = '0x000000000000000000000000000000000000a001';
const POOL_B = '0x000000000000000000000000000000000000b001';
const TRANCHE_A1 = '0x000000000000000000000000000000000000a011';
const TRANCHE_A2 = '0x000000000000000000000000000000000000a012';
const TRANCHE_B1 = '0x000000000000000000000000000000000000b011';

function input(
    overrides: Partial<EpochTrancheYieldInput> = {},
): EpochTrancheYieldInput {
    return {
        epochInterest: 130,
        userShares: 1500,
        trancheShares: 12000,
        trancheBalanceNow: 13000,
        trancheSharesNow: 12500,
        locks: [],
        ...overrides,
    };
}

describe('epochTrancheYield', () => {
    it('is the share-weighted interest when there is no lock', () => {
        const result = epochTrancheYield(input());
        expect(result.total).toBeCloseTo(16.25, 12);
        expect(result.variable).toBe(result.total);
        expect(result.locks).toEqual([]);
    });

    it('splits an active lock out of the base and adds its top-up', () => {
        const result = epochTrancheYield(
            input({
                locks: [
                    {
                        active: true,
                        sharesAtEpoch: 421,
                        sharesBeforeEpoch: 410,
                    },
                ],
            }),
        );
        // base 16.25; lockBase = 16.25 × 410 / 1500; topUp = 11 × 13000 / 12500
        const lockBase = (16.25 * 410) / 1500;
        expect(result.variable).toBeCloseTo(16.25 - lockBase, 12);
        expect(result.locks[0]).toBeCloseTo(lockBase + 11.44, 12);
        expect(result.total).toBeCloseTo(16.25 + 11.44, 12);
    });

    it('counts an inactive lock as zero and leaves the base whole', () => {
        const result = epochTrancheYield(
            input({
                locks: [
                    {
                        active: false,
                        sharesAtEpoch: 999,
                        sharesBeforeEpoch: 1,
                    },
                ],
            }),
        );
        expect(result.locks).toEqual([0]);
        expect(result.variable).toBeCloseTo(16.25, 12);
    });

    it('returns 0, never NaN, for a zero denominator', () => {
        const lock = { active: true, sharesAtEpoch: 5, sharesBeforeEpoch: 2 };
        const noTranche = epochTrancheYield(
            input({ trancheShares: 0, trancheSharesNow: 0, locks: [lock] }),
        );
        expect(noTranche.total).toBe(0);
        const noUser = epochTrancheYield(
            input({ userShares: 0, trancheSharesNow: 0, locks: [lock] }),
        );
        expect(noUser.total).toBe(0);
    });

    it('total is always the base plus every active top-up', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 1e6, noNaN: true }),
                fc.double({ min: 1, max: 1e7, noNaN: true }),
                fc.double({ min: 0, max: 1, noNaN: true }),
                fc.array(
                    fc.record({
                        active: fc.boolean(),
                        sharesBeforeEpoch: fc.double({
                            min: 0,
                            max: 1e5,
                            noNaN: true,
                        }),
                        topUpShares: fc.double({
                            min: 0,
                            max: 100,
                            noNaN: true,
                        }),
                    }),
                    { maxLength: 4 },
                ),
                (interest, trancheShares, userFraction, rawLocks) => {
                    const userShares = trancheShares * userFraction;
                    const locks = rawLocks.map((l) => ({
                        active: l.active,
                        sharesBeforeEpoch: l.sharesBeforeEpoch,
                        sharesAtEpoch: l.sharesBeforeEpoch + l.topUpShares,
                    }));
                    const result = epochTrancheYield({
                        epochInterest: interest,
                        userShares,
                        trancheShares,
                        trancheBalanceNow: trancheShares * 1.05,
                        trancheSharesNow: trancheShares,
                        locks,
                    });
                    const base = (interest * userShares) / trancheShares;
                    const topUps = rawLocks
                        .filter((l) => l.active)
                        .reduce((sum, l) => sum + l.topUpShares * 1.05, 0);
                    expect(result.total).toBeCloseTo(base + topUps, 4);
                },
            ),
        );
    });
});

describe('grossYieldFromNet', () => {
    it('inverts the fee identity weeklyInterest applies: net = gross × (1 − fee)', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 1e6, noNaN: true }),
                fc.double({ min: 0, max: 99.9, noNaN: true }),
                (net, fee) => {
                    const gross = grossYieldFromNet(net, fee);
                    expect(gross * (1 - fee / 100)).toBeCloseTo(net, 6);
                    // The forward direction is the existing net figure's
                    // own formula, applied to the gross as one slice.
                    expect(
                        weeklyInterest([{ balance: gross, epochRate: 1 }], fee),
                    ).toBeCloseTo(net, 6);
                },
            ),
        );
    });

    it('takes the fee as a percentage: 10 means ten percent', () => {
        expect(grossYieldFromNet(9, 10)).toBeCloseTo(10, 12);
        expect(grossYieldFromNet(5, 0)).toBe(5);
    });

    it.each([
        ['an unknown', null],
        ['a NaN', NaN],
        ['a negative', -1],
        ['an above-100', 101],
        ['an exactly-100', 100],
    ])('fails closed on %s fee', (_label, fee) => {
        expect(grossYieldFromNet(10, fee)).toBeNaN();
    });

    it('fails closed on a non-finite net', () => {
        expect(grossYieldFromNet(Infinity, 10)).toBeNaN();
    });
});

function entry(
    epochId: number,
    poolId: string,
    trancheId: string,
    netYield: number,
): YieldHistoryEntry {
    return {
        epochId,
        epochEnd: 1_000_000_000 + (epochId + 1) * 604_800,
        poolId,
        trancheId,
        grossYield: netYield / 0.9,
        netYield,
    };
}

describe('aggregateYieldHistory', () => {
    const entries = [
        entry(9, POOL_B, TRANCHE_B1, 5),
        entry(8, POOL_A, TRANCHE_A1, 20),
        entry(9, POOL_A, TRANCHE_A1, 27),
        entry(9, POOL_A, TRANCHE_A2, 2),
        entry(8, POOL_B, TRANCHE_B1, 4),
    ];

    it('sums every strategy per epoch, ascending', () => {
        const points = aggregateYieldHistory(entries);
        expect(points.map((p) => p.epochId)).toEqual([8, 9]);
        expect(points[0]?.netYield).toBeCloseTo(24, 12);
        expect(points[1]?.netYield).toBeCloseTo(34, 12);
        expect(points[1]?.grossYield).toBeCloseTo(34 / 0.9, 10);
        expect(points[1]?.epochEnd).toBe(1_000_000_000 + 10 * 604_800);
    });

    it('keeps one strategy with poolId, matched case-insensitively', () => {
        const points = aggregateYieldHistory(entries, {
            poolId: POOL_A.toUpperCase().replace('0X', '0x'),
        });
        expect(points.map((p) => [p.epochId, p.netYield])).toEqual([
            [8, 20],
            [9, 29],
        ]);
    });

    it('keeps one tranche with trancheId', () => {
        const points = aggregateYieldHistory(entries, {
            trancheId: TRANCHE_A2,
        });
        expect(points.map((p) => [p.epochId, p.netYield])).toEqual([[9, 2]]);
    });

    it('is empty for an empty history, with no zero padding', () => {
        expect(aggregateYieldHistory([])).toEqual([]);
        expect(aggregateYieldHistory(entries, { poolId: '0x00' })).toEqual([]);
    });

    it('carries an unknown gross through instead of a partial sum', () => {
        const points = aggregateYieldHistory([
            entry(9, POOL_A, TRANCHE_A1, 1),
            { ...entry(9, POOL_B, TRANCHE_B1, 1), grossYield: NaN },
        ]);
        expect(points[0]?.netYield).toBe(2);
        expect(points[0]?.grossYield).toBeNaN();
    });

    it('does not mutate its input', () => {
        const before = JSON.stringify(entries);
        aggregateYieldHistory(entries);
        expect(JSON.stringify(entries)).toBe(before);
    });
});
