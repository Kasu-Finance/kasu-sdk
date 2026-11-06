import * as fc from 'fast-check';

import {
    aggregateYieldHistory,
    epochTrancheYield,
    EpochTrancheYieldInput,
    isPlausibleTopUp,
    MAX_TOP_UP_SHARE_FRACTION,
    YieldHistoryEntry,
} from './yield-history';

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

    it('books no yield on a negative share count (shares the ledger never credited)', () => {
        // A wallet that received shares from another wallet withdraws more
        // than the subgraph ledger credited it: its count goes negative. That
        // is not a negative yield. Real shape: −30 017.29 shares in a tranche
        // of 232 846.69 that was credited 740.18.
        const result = epochTrancheYield(
            input({
                epochInterest: 740.176373,
                userShares: Number('-30017.2882178693575841'),
                trancheShares: Number('232846.694674864406100479'),
                locks: [
                    { active: true, sharesAtEpoch: 10, sharesBeforeEpoch: 10 },
                ],
            }),
        );
        expect(result.total).toBe(0);
        expect(result.variable).toBe(0);
        expect(result.locks).toEqual([0]);
    });

    it('books no top-up for a lock-share change no clearing can make', () => {
        // Real shape: a lock of 431.000250505 shares recorded as 0 at a
        // clearing, its shares still in the fixed-term contract. Valued at
        // today's price that read as −553 of "yield" for a 500 deposit.
        const result = epochTrancheYield(
            input({
                epochInterest: 4339.402805,
                userShares: Number('431.000250505106433893'),
                trancheShares: Number('1653014.919696082472702442'),
                trancheBalanceNow: 2631644.85667,
                trancheSharesNow: Number('2049088.940978179611446023'),
                locks: [
                    {
                        active: true,
                        sharesBeforeEpoch: Number('431.000250505106433893'),
                        sharesAtEpoch: 0,
                    },
                ],
            }),
        );
        const base =
            (4339.402805 * Number('431.000250505106433893')) /
            Number('1653014.919696082');
        expect(result.total).toBeCloseTo(base, 10);
        expect(result.total).toBeGreaterThan(0);
        // The base is all the lock's (it held every share), and nothing else.
        expect(result.locks[0]).toBeCloseTo(base, 10);
        expect(result.variable).toBeCloseTo(0, 10);
    });

    it('keeps a negative top-up a real clearing makes (fixed rate below the variable)', () => {
        const result = epochTrancheYield(
            input({
                locks: [
                    {
                        active: true,
                        sharesBeforeEpoch: 410,
                        sharesAtEpoch: 409,
                    },
                ],
            }),
        );
        // −1 share × 13000 / 12500 = −1.04
        expect(result.total).toBeCloseTo(16.25 - 1.04, 12);
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
                            min: 1,
                            max: 1e5,
                            noNaN: true,
                        }),
                        // A top-up a clearing can make: within the band.
                        topUpFraction: fc.double({
                            min: -MAX_TOP_UP_SHARE_FRACTION * 0.99,
                            max: MAX_TOP_UP_SHARE_FRACTION * 0.99,
                            noNaN: true,
                        }),
                    }),
                    { maxLength: 4 },
                ),
                (interest, trancheShares, userFraction, rawLocks) => {
                    const userShares = trancheShares * userFraction;
                    const withShares = rawLocks.map((l) => ({
                        ...l,
                        topUpShares: l.sharesBeforeEpoch * l.topUpFraction,
                    }));
                    const locks = withShares.map((l) => ({
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
                    const base =
                        userShares > 0
                            ? (interest * userShares) / trancheShares
                            : 0;
                    const topUps = withShares
                        .filter((l) => l.active)
                        .reduce((sum, l) => sum + l.topUpShares * 1.05, 0);
                    expect(result.total).toBeCloseTo(base + topUps, 4);
                },
            ),
        );
    });

    it('a lock-share change outside the band is never yield', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 1, max: 1e6, noNaN: true }),
                fc.double({
                    min: MAX_TOP_UP_SHARE_FRACTION * 1.0001,
                    max: 50,
                    noNaN: true,
                }),
                fc.boolean(),
                (sharesBefore, fraction, down) => {
                    const sharesAt = down
                        ? Math.max(0, sharesBefore * (1 - fraction))
                        : sharesBefore * (1 + fraction);
                    const withLock = epochTrancheYield(
                        input({
                            locks: [
                                {
                                    active: true,
                                    sharesBeforeEpoch: sharesBefore,
                                    sharesAtEpoch: sharesAt,
                                },
                            ],
                            userShares: sharesBefore + 100,
                            trancheShares: (sharesBefore + 100) * 8,
                        }),
                    );
                    // Only the base: the interest × the lender's share.
                    expect(withLock.total).toBeCloseTo(130 / 8, 8);
                },
            ),
        );
    });
});

describe('isPlausibleTopUp', () => {
    it.each([
        [410, 421, true],
        [410, 409, true],
        [100, 105, true],
        [100, 95, true],
        [100, 105.01, false],
        [Number('431.000250505106433893'), 0, false],
        [0, 0, true],
        [0, 5, false],
    ])('%d → %d: %s', (before, at, expected) => {
        expect(isPlausibleTopUp(before, at)).toBe(expected);
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

    it('carries net only: no gross on a point', () => {
        const [point] = aggregateYieldHistory([
            entry(9, POOL_A, TRANCHE_A1, 1),
        ]);
        expect(Object.keys(point).sort()).toEqual([
            'epochEnd',
            'epochId',
            'netYield',
        ]);
    });

    it('does not mutate its input', () => {
        const before = JSON.stringify(entries);
        aggregateYieldHistory(entries);
        expect(JSON.stringify(entries)).toBe(before);
    });
});
