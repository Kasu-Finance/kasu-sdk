import fc from 'fast-check';

import { apyToEpochRate, netEffectiveApy } from './rates';
import {
    accruedInterest,
    accruedInterestSince,
    dailyInterest,
    epochAccrual,
    EpochAccrual,
    epochEndTimestamp,
    InterestSlice,
    MAX_ACCRUAL_EPOCHS,
    projectedAnnualEarnings,
    SECONDS_PER_WEEK,
    weeklyInterest,
    weightedAverageApy,
} from './yields';

// Ported from kasu-ui `src/features/portfolio/lib/compute-yields.test.ts` and
// `compute-yields.property.test.ts`, behaviour for behaviour.

/**
 * A portfolio shaped like a real one: seven slices across four tranches — one
 * zero-balance variable position, three locks on one fixed-term config, three
 * variable residuals. The per-epoch rates are subgraph `interestRate` /
 * `epochInterestRate` values (public, per tranche); the balances are
 * synthetic round numbers, so no lender's position is in this repository.
 */
const PORTFOLIO: readonly InterestSlice[] = [
    { balance: 10_000, epochRate: 0.00251430639960715 },
    { balance: 0, epochRate: 0.003818238832525632 },
    { balance: 25_000, epochRate: 0.00251430639960715 },
    { balance: 500_000, epochRate: 0.002848512117642616 },
    { balance: 50_000, epochRate: 0.002848512117642616 },
    { balance: 150_000, epochRate: 0.002848512117642616 },
    { balance: 40_000, epochRate: 0.0028485121176427 },
];
/** Σ(balance × epochRate) over PORTFOLIO. */
const PORTFOLIO_GROSS = 2195.8996910417895;

/** The live 10% performance fee, as a PERCENTAGE — `10`, never `0.10`. */
const FEE = 10;

describe('weightedAverageApy', () => {
    it('returns 0 for an empty portfolio', () => {
        expect(weightedAverageApy([])).toBe(0);
    });

    it('returns 0 when every slice has zero or negative balance', () => {
        expect(weightedAverageApy([{ balance: 0, apy: 0.1 }])).toBe(0);
        expect(weightedAverageApy([{ balance: -5, apy: 0.1 }])).toBe(0);
    });

    it('returns the single tranche APY when only one tranche has balance', () => {
        expect(weightedAverageApy([{ balance: 1000, apy: 0.12 }])).toBeCloseTo(
            0.12,
        );
    });

    it('weights APY by balance across tranches', () => {
        // 75/25 split between 10% and 20% → 0.125
        expect(
            weightedAverageApy([
                { balance: 750, apy: 0.1 },
                { balance: 250, apy: 0.2 },
            ]),
        ).toBeCloseTo(0.125);
    });

    it('skips non-finite slices rather than poisoning the average', () => {
        expect(
            weightedAverageApy([
                { balance: 1000, apy: 0.1 },
                { balance: Number.NaN, apy: 0.5 },
                { balance: 1000, apy: Number.POSITIVE_INFINITY },
            ]),
        ).toBeCloseTo(0.1);
    });

    it('is bounded by the min and max APY of the positive-balance slices', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        balance: fc.double({
                            min: 0.01,
                            max: 1e9,
                            noNaN: true,
                            noDefaultInfinity: true,
                        }),
                        apy: fc.double({
                            min: 0,
                            max: 1,
                            noNaN: true,
                            noDefaultInfinity: true,
                        }),
                    }),
                    { minLength: 1, maxLength: 30 },
                ),
                (slices) => {
                    const result = weightedAverageApy(slices);
                    const apys = slices.map((s) => s.apy);
                    expect(result).toBeGreaterThanOrEqual(
                        Math.min(...apys) - 1e-9,
                    );
                    expect(result).toBeLessThanOrEqual(
                        Math.max(...apys) + 1e-9,
                    );
                },
            ),
        );
    });
});

describe('weeklyInterest', () => {
    it('is the portfolio projection, net of the fee', () => {
        expect(weeklyInterest(PORTFOLIO, FEE)).toBeCloseTo(
            PORTFOLIO_GROSS * 0.9,
            6,
        );
        expect(weeklyInterest(PORTFOLIO, FEE)).toBeCloseTo(1976.309722, 6);
    });

    it('is the gross projection at a zero fee', () => {
        expect(weeklyInterest(PORTFOLIO, 0)).toBeCloseTo(PORTFOLIO_GROSS, 6);
    });

    it('leaves the lender nothing at a 100% fee', () => {
        expect(weeklyInterest(PORTFOLIO, 100)).toBe(0);
    });

    it('FAILS CLOSED on an unusable fee rather than projecting gross', () => {
        expect(weeklyInterest(PORTFOLIO, null)).toBeNull();
        expect(weeklyInterest(PORTFOLIO, Number.NaN)).toBeNull();
        expect(weeklyInterest(PORTFOLIO, Number.POSITIVE_INFINITY)).toBeNull();
        // Outside 0..100 — the units error that reads `10` as a fraction, and
        // its mirror image.
        expect(weeklyInterest(PORTFOLIO, -1)).toBeNull();
        expect(weeklyInterest(PORTFOLIO, 101)).toBeNull();
    });

    it('skips non-finite, zero and negative balances instead of poisoning the total', () => {
        const clean = weeklyInterest([{ balance: 1000, epochRate: 0.002 }], 0);
        const polluted = weeklyInterest(
            [
                { balance: 1000, epochRate: 0.002 },
                { balance: Number.NaN, epochRate: 0.002 },
                { balance: Number.POSITIVE_INFINITY, epochRate: 0.002 },
                { balance: 0, epochRate: 0.002 },
                { balance: -1000, epochRate: 0.002 },
            ],
            0,
        );
        expect(clean).toBe(2);
        expect(polluted).toBe(clean);
    });

    it('FAILS CLOSED on a funded slice whose rate is UNKNOWN, rather than under-reporting', () => {
        // Treating the unknown rate as 0 would return 2 — a number that
        // silently omits the other 5,000 and states it as the whole figure.
        expect(
            weeklyInterest(
                [
                    { balance: 1000, epochRate: 0.002 },
                    { balance: 5000, epochRate: Number.NaN },
                ],
                0,
            ),
        ).toBeNull();
        expect(
            weeklyInterest(
                [{ balance: 5000, epochRate: Number.POSITIVE_INFINITY }],
                0,
            ),
        ).toBeNull();
        expect(
            weeklyInterest(
                [{ balance: 5000, epochRate: Number.NEGATIVE_INFINITY }],
                0,
            ),
        ).toBeNull();
    });

    it('keeps a genuinely ZERO configured rate distinguishable from an unknown one', () => {
        expect(
            weeklyInterest(
                [
                    { balance: 1000, epochRate: 0.002 },
                    { balance: 5000, epochRate: 0 },
                ],
                0,
            ),
        ).toBe(2);
        expect(weeklyInterest([{ balance: 5000, epochRate: 0 }], 0)).toBe(0);
    });

    it('still ignores an unknown rate on a slice with NOTHING in it', () => {
        expect(
            weeklyInterest(
                [
                    { balance: 1000, epochRate: 0.002 },
                    { balance: 0, epochRate: Number.NaN },
                ],
                0,
            ),
        ).toBe(2);
    });

    it('returns 0 for a portfolio with nothing lent — not null', () => {
        expect(weeklyInterest([], FEE)).toBe(0);
    });

    it('never derives the rate from an APY', () => {
        // A slice carrying an inconsistent `apy` projects from `epochRate`
        // alone: reading the APY would land near 1,000 × apyToEpochRate(0.5).
        const inconsistent = { balance: 1000, apy: 0.5, epochRate: 0.002 };
        expect(weeklyInterest([inconsistent], 0)).toBe(2);
        expect(1000 * apyToEpochRate(0.5)).not.toBeCloseTo(2, 1);
    });

    const positiveSlices = fc.array(
        fc.record({
            balance: fc.double({
                min: 0.01,
                max: 1e9,
                noNaN: true,
                noDefaultInfinity: true,
            }),
            epochRate: fc.double({
                min: 0,
                max: 0.02,
                noNaN: true,
                noDefaultInfinity: true,
            }),
        }),
        { minLength: 1, maxLength: 30 },
    );
    const fee = fc.double({
        min: 0,
        max: 100,
        noNaN: true,
        noDefaultInfinity: true,
    });

    it('never exceeds the gross projection, and falls as the fee rises', () => {
        fc.assert(
            fc.property(positiveSlices, fee, fee, (slices, feeA, feeB) => {
                const [lower, higher] =
                    feeA <= feeB ? [feeA, feeB] : [feeB, feeA];
                const gross = weeklyInterest(slices, 0);
                const atLower = weeklyInterest(slices, lower);
                const atHigher = weeklyInterest(slices, higher);
                // In-domain fees always produce a figure.
                if (gross === null || atLower === null || atHigher === null) {
                    throw new Error('an in-domain fee returned null');
                }
                expect(atLower).toBeLessThanOrEqual(gross);
                expect(atHigher).toBeLessThanOrEqual(atLower);
                expect(atHigher).toBeGreaterThanOrEqual(0);
            }),
        );
    });

    it('is null for every fee outside 0..100, whatever the slices', () => {
        fc.assert(
            fc.property(
                positiveSlices,
                fc.oneof(
                    fc.double({
                        min: -1e6,
                        max: -1e-9,
                        noNaN: true,
                        noDefaultInfinity: true,
                    }),
                    fc.double({
                        min: 100 + 1e-9,
                        max: 1e6,
                        noNaN: true,
                        noDefaultInfinity: true,
                    }),
                ),
                (slices, badFee) => {
                    expect(weeklyInterest(slices, badFee)).toBeNull();
                },
            ),
        );
    });
});

describe('dailyInterest', () => {
    it('is a seventh of the weekly figure', () => {
        expect(dailyInterest(1976.3097219376107)).toBeCloseTo(282.32996, 5);
    });

    it('carries the portfolio end to end', () => {
        expect(dailyInterest(weeklyInterest(PORTFOLIO, FEE))).toBeCloseTo(
            282.32996,
            5,
        );
    });

    it('FAILS CLOSED with its input', () => {
        expect(dailyInterest(null)).toBeNull();
        expect(dailyInterest(Number.NaN)).toBeNull();
        expect(dailyInterest(Number.POSITIVE_INFINITY)).toBeNull();
    });

    it('passes a genuine zero through', () => {
        expect(dailyInterest(0)).toBe(0);
    });

    it('is exactly a seventh for every finite weekly figure', () => {
        fc.assert(
            fc.property(
                fc.double({
                    min: 0,
                    max: 1e9,
                    noNaN: true,
                    noDefaultInfinity: true,
                }),
                (weekly) => {
                    expect(dailyInterest(weekly)).toBe(weekly / 7);
                },
            ),
        );
    });
});

/**
 * Per-pool accrual. The shape modelled: five pools cleared one epoch while a
 * sixth sat sixteen days behind on an older close — pools clear
 * independently.
 */
describe('accruedInterest', () => {
    const DAY = 86_400;
    /** An epoch close, in unix seconds (2026-09-10 05:35:41 UTC). */
    const FRESH_CLOSE = 1_789_018_541;
    const STALE_CLOSE = FRESH_CLOSE - 20 * DAY;
    const FRESH_CLOSE_PREVIOUS = FRESH_CLOSE - 7 * DAY;
    const STALE_WEEKLY = 70;
    const FRESH_WEEKLY = 140;
    /** Settled lifetime interest before the fresh pool capitalises its epoch. */
    const BASE = 1000;

    it('accrues each pool from ITS OWN close, not from the newest close anywhere', () => {
        // 70 (capped) + 140 × 3/7 = 130. One shared anchor would read 90.
        expect(
            accruedInterest(
                [
                    {
                        weeklyInterest: STALE_WEEKLY,
                        clearingTimestamp: STALE_CLOSE,
                    },
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                FRESH_CLOSE + 3 * DAY,
            ),
        ).toBeCloseTo(130, 10);
    });

    it('NEVER DROPS when one pool clears while another stays stale', () => {
        const before =
            BASE +
            accruedInterest(
                [
                    {
                        weeklyInterest: STALE_WEEKLY,
                        clearingTimestamp: STALE_CLOSE,
                    },
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE_PREVIOUS,
                    },
                ],
                FRESH_CLOSE,
            );
        // The fresh pool clears: the chain capitalises ITS epoch into the
        // settled base, and only ITS anchor moves.
        const after =
            BASE +
            FRESH_WEEKLY +
            accruedInterest(
                [
                    {
                        weeklyInterest: STALE_WEEKLY,
                        clearingTimestamp: STALE_CLOSE,
                    },
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                FRESH_CLOSE,
            );
        expect(before).toBeCloseTo(1210, 10);
        expect(after).toBeCloseTo(1210, 10);
        expect(after).toBeGreaterThanOrEqual(before);

        // The same instant with ONE shared anchor — the drop is real, so the
        // assertion above is not vacuous.
        const sharedBefore =
            BASE +
            accruedInterest(
                [
                    {
                        weeklyInterest: STALE_WEEKLY + FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE_PREVIOUS,
                    },
                ],
                FRESH_CLOSE,
            );
        const sharedAfter =
            BASE +
            FRESH_WEEKLY +
            accruedInterest(
                [
                    {
                        weeklyInterest: STALE_WEEKLY + FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                FRESH_CLOSE,
            );
        expect(sharedBefore).toBeCloseTo(1210, 10);
        expect(sharedAfter).toBeCloseTo(1140, 10);
        expect(sharedBefore - sharedAfter).toBeCloseTo(STALE_WEEKLY, 10);
    });

    it('keeps rising through the cycle that follows', () => {
        expect(
            accruedInterest(
                [
                    {
                        weeklyInterest: STALE_WEEKLY,
                        clearingTimestamp: STALE_CLOSE,
                    },
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                FRESH_CLOSE + DAY,
            ),
        ).toBeCloseTo(90, 10);
    });

    it('caps each pool at one epoch of its own interest', () => {
        expect(
            accruedInterest(
                [
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                FRESH_CLOSE + 10 * DAY,
            ),
        ).toBe(FRESH_WEEKLY);
    });

    it('never goes negative when a close is ahead of the local clock', () => {
        expect(
            accruedInterest(
                [
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                FRESH_CLOSE - 3 * DAY,
            ),
        ).toBe(0);
    });

    it('is exactly the epoch figure one epoch after the close', () => {
        expect(
            accruedInterest(
                [
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                FRESH_CLOSE + SECONDS_PER_WEEK,
            ),
        ).toBe(FRESH_WEEKLY);
    });

    it('accrues nothing for a lender with no priced, anchored pool', () => {
        expect(accruedInterest([], FRESH_CLOSE + DAY)).toBe(0);
    });

    it('drops a poisoned term rather than poisoning the whole sum', () => {
        expect(
            accruedInterest(
                [
                    {
                        weeklyInterest: Number.NaN,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: Number.NaN,
                    },
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                FRESH_CLOSE + DAY,
            ),
        ).toBeCloseTo(20, 10);
        expect(
            accruedInterest(
                [
                    {
                        weeklyInterest: FRESH_WEEKLY,
                        clearingTimestamp: FRESH_CLOSE,
                    },
                ],
                Number.NaN,
            ),
        ).toBe(0);
    });

    it('never exceeds one epoch of each pool, and never goes backwards in time', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        weeklyInterest: fc.double({
                            min: 0,
                            max: 1e6,
                            noNaN: true,
                            noDefaultInfinity: true,
                        }),
                        clearingTimestamp: fc.integer({
                            min: FRESH_CLOSE - 30 * DAY,
                            max: FRESH_CLOSE + 30 * DAY,
                        }),
                    }),
                    { maxLength: 10 },
                ),
                fc.integer({ min: 0, max: 60 * DAY }),
                fc.integer({ min: 0, max: 60 * DAY }),
                (accruals, a, b) => {
                    const [earlier, later] = a <= b ? [a, b] : [b, a];
                    const start = FRESH_CLOSE - 30 * DAY;
                    const atEarlier = accruedInterest(
                        accruals,
                        start + earlier,
                    );
                    const atLater = accruedInterest(accruals, start + later);
                    const cap = accruals.reduce(
                        (sum, x) => sum + x.weeklyInterest,
                        0,
                    );
                    expect(atLater).toBeGreaterThanOrEqual(atEarlier - 1e-6);
                    expect(atLater).toBeLessThanOrEqual(cap + 1e-6);
                    expect(atEarlier).toBeGreaterThanOrEqual(0);
                },
            ),
        );
    });
});

describe('epochEndTimestamp', () => {
    // Base `SystemVariables`, read on chain: epochStartTimestamp(0),
    // epochStartTimestamp(124) (Thu 22 Oct 2026 06:00 UTC), (125) and (126).
    const BASE_INITIAL = 1_717_653_600;
    const START_124 = 1_792_648_800;
    const START_125 = 1_793_253_600;
    const START_126 = 1_793_858_400;

    it('is the next epoch’s start, from the live Base epoch zero', () => {
        expect(epochEndTimestamp(BASE_INITIAL, 124)).toBe(START_125);
        expect(epochEndTimestamp(BASE_INITIAL, 125)).toBe(START_126);
        expect(epochEndTimestamp(BASE_INITIAL, 123)).toBe(START_124);
        expect(epochEndTimestamp(BASE_INITIAL, 0)).toBe(
            BASE_INITIAL + SECONDS_PER_WEEK,
        );
    });

    it('returns NaN for an epoch that is not a non-negative integer', () => {
        for (const epoch of [
            -1,
            1.5,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.MAX_SAFE_INTEGER + 1,
        ]) {
            expect(epochEndTimestamp(BASE_INITIAL, epoch)).toBeNaN();
        }
    });

    it('returns NaN for an initial start that is not a positive integer', () => {
        for (const initial of [
            0,
            -1,
            -BASE_INITIAL,
            1.5,
            BASE_INITIAL + 0.5,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.MAX_SAFE_INTEGER + 1,
        ]) {
            expect(epochEndTimestamp(initial, 124)).toBeNaN();
        }
    });

    it('returns NaN rather than an imprecise end past the safe range', () => {
        expect(
            epochEndTimestamp(Number.MAX_SAFE_INTEGER - SECONDS_PER_WEEK, 1),
        ).toBeNaN();
        expect(
            epochEndTimestamp(Number.MAX_SAFE_INTEGER - SECONDS_PER_WEEK, 0),
        ).toBe(Number.MAX_SAFE_INTEGER);
    });
});

// Base, read on chain and from the subgraph: epochStartTimestamp(0); the ends
// of epochs 123 and 124; and the two clearings' startTimestamp — epoch 123's
// 17 s AFTER its epoch ended (late), epoch 124's on Wed 28 Oct 2026
// 03:53:23 UTC, inside its window (on time).
const BASE_INITIAL = 1_717_653_600;
const END_123 = 1_792_648_800;
const END_124 = 1_793_253_600;
const E123_CLEARING_START = 1_792_648_817;
const E124_CLEARING_START = 1_793_159_603;

describe('epochAccrual', () => {
    it('anchors an on-time clearing at its own start', () => {
        expect(
            epochAccrual({
                weeklyInterest: 140,
                initialEpochStart: BASE_INITIAL,
                lastClearedEpoch: 124,
                clearingStartedAt: E124_CLEARING_START,
            }),
        ).toEqual({
            weeklyInterest: 140,
            accruesFrom: E124_CLEARING_START,
            epochEnd: END_124,
        });
    });

    it('anchors a late clearing at its epoch end, however late', () => {
        expect(
            epochAccrual({
                weeklyInterest: 140,
                initialEpochStart: BASE_INITIAL,
                lastClearedEpoch: 123,
                clearingStartedAt: E123_CLEARING_START,
            }),
        ).toEqual({
            weeklyInterest: 140,
            accruesFrom: END_123,
            epochEnd: END_123,
        });
        for (const startedAt of [END_124, END_124 + 10 * 86_400]) {
            expect(
                epochAccrual({
                    weeklyInterest: 140,
                    initialEpochStart: BASE_INITIAL,
                    lastClearedEpoch: 124,
                    clearingStartedAt: startedAt,
                }),
            ).toEqual({
                weeklyInterest: 140,
                accruesFrom: END_124,
                epochEnd: END_124,
            });
        }
    });

    it('accepts a genuine zero weekly figure', () => {
        expect(
            epochAccrual({
                weeklyInterest: 0,
                initialEpochStart: BASE_INITIAL,
                lastClearedEpoch: 124,
                clearingStartedAt: E124_CLEARING_START,
            })?.weeklyInterest,
        ).toBe(0);
    });

    const valid = {
        weeklyInterest: 140,
        initialEpochStart: BASE_INITIAL,
        lastClearedEpoch: 124,
        clearingStartedAt: E124_CLEARING_START,
    };

    it('is null for an epoch or initial start epochEndTimestamp rejects', () => {
        for (const lastClearedEpoch of [-1, 1.5, Number.NaN]) {
            expect(epochAccrual({ ...valid, lastClearedEpoch })).toBeNull();
        }
        for (const initialEpochStart of [
            0,
            -1,
            1.5,
            Number.POSITIVE_INFINITY,
        ]) {
            expect(epochAccrual({ ...valid, initialEpochStart })).toBeNull();
        }
    });

    it('is null for a clearing start that is not a finite positive number', () => {
        for (const clearingStartedAt of [
            0,
            -1,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ]) {
            expect(epochAccrual({ ...valid, clearingStartedAt })).toBeNull();
        }
    });

    it('is null for a weekly figure that is not finite or is negative', () => {
        for (const weeklyInterest of [
            -1,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ]) {
            expect(epochAccrual({ ...valid, weeklyInterest })).toBeNull();
        }
    });
});

describe('accruedInterestSince', () => {
    const W = SECONDS_PER_WEEK;
    const DAY = 86_400;
    const HOURS_48 = 2 * DAY;
    const WEEKLY = 140;
    const BASE = 1000;
    const end = (epoch: number): number =>
        epochEndTimestamp(BASE_INITIAL, epoch);

    /** A validated term; a fixture the builder rejects is a broken test. */
    const term = (
        epoch: number,
        clearingStartedAt: number,
        weekly = WEEKLY,
    ): EpochAccrual => {
        const built = epochAccrual({
            weeklyInterest: weekly,
            initialEpochStart: BASE_INITIAL,
            lastClearedEpoch: epoch,
            clearingStartedAt,
        });
        if (built === null) throw new Error('invalid fixture');
        return built;
    };
    const acc = (t: EpochAccrual, now: number): number =>
        accruedInterestSince([t], now);

    /** |a − b| within a relative float tolerance. */
    const tol = (...xs: number[]): number =>
        1e-9 * Math.max(1, ...xs.map(Math.abs));
    const expectClose = (a: number, b: number): void => {
        expect(Math.abs(a - b)).toBeLessThanOrEqual(tol(a, b));
    };

    it('is 4/3 of an epoch at 7 Nov 14:00 UTC after the on-time epoch-124 clearing', () => {
        // 2026-11-07 14:00 UTC; epoch 125's clearing never ran. One epoch from
        // Wed 28 Oct 03:53, held until Thu 5 Nov 06:00, then 56 h more.
        const now = 1_794_060_000;
        expect(acc(term(124, E124_CLEARING_START), now)).toBeCloseTo(
            (WEEKLY * 4) / 3,
            10,
        );
    });

    it('accrues exactly three epochs, below the cap, three weeks after a late anchor', () => {
        expect(acc(term(124, END_124 + DAY), END_124 + 3 * W)).toBe(3 * WEEKLY);
    });

    it('caps one pool at four epochs of its weekly figure', () => {
        expect(MAX_ACCRUAL_EPOCHS).toBe(4);
        const t = term(124, END_124 + DAY);
        expect(acc(t, END_124 + 3.5 * W)).toBeCloseTo(3.5 * WEEKLY, 10);
        expect(acc(t, END_124 + 4 * W)).toBe(4 * WEEKLY);
        expect(acc(t, END_124 + 4 * W + 1)).toBe(4 * WEEKLY);
        expect(acc(t, END_124 + 124 * W)).toBe(4 * WEEKLY);
    });

    it('shows exactly four epochs for a pool 6.34 epochs behind its last clearing', () => {
        // A pool that keeps lending but is no longer cleared, and is not
        // flagged stopped: without the cap it would show 6.34 epochs unpaid.
        expect(acc(term(124, END_124 + DAY), END_124 + 6.34 * W)).toBe(
            4 * WEEKLY,
        );
        // On-time anchors hit the same ceiling.
        expect(acc(term(124, E124_CLEARING_START), END_124 + 6.34 * W)).toBe(
            4 * WEEKLY,
        );
    });

    it('caps each pool on its own, not the sum', () => {
        const capped = term(100, end(100) + DAY, 10);
        const fresh = term(124, END_124 + DAY, WEEKLY);
        const now = END_124 + W;
        expect(accruedInterestSince([capped, fresh], now)).toBeCloseTo(
            4 * 10 + WEEKLY,
            10,
        );
    });

    it('at the cap, a catch-up steps up by at most one weekly per epoch cleared, never down', () => {
        // Last cleared late at epoch n; 6.34 epochs later the clearings of
        // n+1 … n+6 all run at the same instant, in order (the way one pool
        // caught up epochs 116 to 119 in a single block).
        const n = 116;
        const at = end(n) + 6.34 * W;
        let previous = term(n, end(n) + DAY);
        let base = BASE;
        const steps: number[] = [];
        for (let j = 1; j <= 6; j++) {
            const before = base + acc(previous, at);
            base += WEEKLY;
            const next = term(n + j, at);
            const after = base + acc(next, at);
            steps.push((after - before) / WEEKLY);
            expect(after).toBeLessThanOrEqual(
                base + MAX_ACCRUAL_EPOCHS * WEEKLY + tol(after),
            );
            previous = next;
        }
        const expected = [1, 1, 0.34, 0, 0, 0];
        steps.forEach((step, i) => {
            expect(Math.abs(step - expected[i])).toBeLessThanOrEqual(1e-9);
        });
    });

    it('keeps ticking where the capped figure froze', () => {
        const t = term(124, E124_CLEARING_START);
        expect(
            acc(t, END_124 + 10 * DAY + 1) - acc(t, END_124 + 10 * DAY),
        ).toBeCloseTo(WEEKLY / W, 12);
        const capped = (now: number): number =>
            accruedInterest(
                [
                    {
                        weeklyInterest: WEEKLY,
                        clearingTimestamp: E124_CLEARING_START,
                    },
                ],
                now,
            );
        expect(capped(END_124 + 10 * DAY)).toBe(WEEKLY);
        expect(capped(END_124 + 10 * DAY + 1)).toBe(WEEKLY);
    });

    it('holds after an on-time anchor until the next epoch ends — at most 48 h', () => {
        const t = term(124, E124_CLEARING_START);
        const holdStart = E124_CLEARING_START + W;
        const holdEnd = END_124 + W;
        expect(holdEnd - holdStart).toBe(END_124 - E124_CLEARING_START);
        expect(holdEnd - holdStart).toBeLessThanOrEqual(HOURS_48);
        expect(acc(t, holdStart - 1)).toBeLessThan(WEEKLY);
        expect(acc(t, holdStart)).toBe(WEEKLY);
        expect(acc(t, holdStart + DAY)).toBe(WEEKLY);
        expect(acc(t, holdEnd)).toBe(WEEKLY);
        expect(acc(t, holdEnd + 1)).toBeGreaterThan(WEEKLY);
    });

    it('never holds after a late anchor', () => {
        const t = term(124, END_124 + DAY);
        expect(t.accruesFrom).toBe(t.epochEnd);
        const at = END_124 + W;
        expect(acc(t, at - 1)).toBeLessThan(acc(t, at));
        expect(acc(t, at)).toBeLessThan(acc(t, at + 1));
    });

    it('accrues each pool from ITS OWN anchor', () => {
        expect(
            accruedInterestSince(
                [term(122, end(122), 70), term(124, END_124, 140)],
                END_124 + 3 * DAY,
            ),
        ).toBeCloseTo(70 * (2 + 3 / 7) + 140 * (3 / 7), 10);
    });

    it('starts a deposit accepted at an on-time clearing at exactly 0, never below', () => {
        // A first-time lender: $500k accepted at the epoch-124 clearing, which
        // applied that epoch's interest BEFORE accepting it.
        const weeklyNew = 500_000 * 0.00285 * 0.9;
        const t = term(124, E124_CLEARING_START, weeklyNew);
        expect(acc(t, E124_CLEARING_START)).toBe(0);
        for (const now of [
            E124_CLEARING_START + 1,
            E124_CLEARING_START + DAY,
            END_124,
        ]) {
            expect(acc(t, now)).toBeCloseTo(
                (weeklyNew * (now - E124_CLEARING_START)) / W,
                10,
            );
            expect(acc(t, now)).toBeGreaterThan(0);
        }
    });

    it('a top-up at an on-time clearing does not dip the total', () => {
        // Epoch 123 cleared on time a week earlier; epoch 124's clearing
        // credits `weekly` at the OLD balance, then accepts a top-up.
        const before =
            BASE + acc(term(123, E124_CLEARING_START - W), E124_CLEARING_START);
        const after =
            BASE +
            WEEKLY +
            acc(
                term(124, E124_CLEARING_START, 3 * WEEKLY),
                E124_CLEARING_START,
            );
        expect(before).toBe(BASE + WEEKLY);
        expect(after).toBe(BASE + WEEKLY);
    });

    it('an anchor ahead of the local clock contributes 0, never a negative', () => {
        const t = term(124, E124_CLEARING_START);
        expect(acc(t, E124_CLEARING_START - DAY)).toBe(0);
        expect(acc(t, E124_CLEARING_START - 100 * W)).toBe(0);
    });

    it('skips a term that is inconsistent, non-finite or negative', () => {
        const good = {
            weeklyInterest: WEEKLY,
            accruesFrom: END_124,
            epochEnd: END_124,
        };
        expect(
            accruedInterestSince(
                [
                    { ...good, weeklyInterest: Number.NaN },
                    { ...good, weeklyInterest: Number.POSITIVE_INFINITY },
                    { ...good, weeklyInterest: -WEEKLY },
                    { ...good, accruesFrom: Number.NaN },
                    { ...good, accruesFrom: Number.NEGATIVE_INFINITY },
                    { ...good, epochEnd: Number.NaN },
                    { ...good, epochEnd: Number.POSITIVE_INFINITY },
                    // The anchor is never after the epoch end.
                    { ...good, accruesFrom: END_124 + 1 },
                    good,
                ],
                END_124 + DAY,
            ),
        ).toBeCloseTo(20, 10);
    });

    it('accrues nothing at a non-finite now, or with no terms', () => {
        const t = term(124, E124_CLEARING_START);
        for (const now of [
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ]) {
            expect(acc(t, now)).toBe(0);
        }
        expect(accruedInterestSince([], END_124 + DAY)).toBe(0);
    });

    const weeklyArb = fc.double({
        min: 1e-6,
        max: 1e7,
        noNaN: true,
        noDefaultInfinity: true,
    });
    const settledArb = fc.double({
        min: 0,
        max: 1e9,
        noNaN: true,
        noDefaultInfinity: true,
    });
    const epochArb = fc.integer({ min: 0, max: 300 });
    const inWindowArb = fc.integer({ min: 1, max: HOURS_48 });

    it('property: never negative and never NaN, for any input', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        weeklyInterest: fc.double(),
                        accruesFrom: fc.double(),
                        epochEnd: fc.double(),
                    }),
                    { maxLength: 10 },
                ),
                fc.double(),
                (accruals, now) => {
                    const accrued = accruedInterestSince(accruals, now);
                    expect(Number.isNaN(accrued)).toBe(false);
                    expect(accrued).toBeGreaterThanOrEqual(0);
                },
            ),
        );
    });

    it('property: on time after on time is the deprecated function, at every instant', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                settledArb,
                epochArb,
                inWindowArb,
                inWindowArb,
                fc.array(fc.double({ min: 0, max: 1, noNaN: true }), {
                    minLength: 1,
                    maxLength: 12,
                }),
                (weekly, settled, n, delta1, delta2, fractions) => {
                    // Epoch n clears δ1 before its end, epoch n+1 δ2 before
                    // its end: 120–216 h apart.
                    const t1 = end(n) - delta1;
                    const t2 = end(n + 1) - delta2;
                    const gap = t2 - t1;
                    expect(gap).toBeGreaterThan(120 * 3600);
                    expect(gap).toBeLessThan(216 * 3600);
                    // Up to the end of epoch n+2, by which the next clearing
                    // must have run.
                    const until = end(n + 1) + W;
                    for (const f of fractions) {
                        const now = Math.min(t1 + f * (until - t1), until - 1);
                        const [base, anchor, epoch] =
                            now < t2
                                ? [settled, t1, n]
                                : [settled + weekly, t2, n + 1];
                        const ours =
                            base + acc(term(epoch, anchor, weekly), now);
                        const old =
                            base +
                            accruedInterest(
                                [
                                    {
                                        weeklyInterest: weekly,
                                        clearingTimestamp: anchor,
                                    },
                                ],
                                now,
                            );
                        expectClose(ours, old);
                    }
                },
            ),
        );
    });

    it('property: on time after on time steps up by weekly × (W − gap) / W when gap < W, else not at all', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                epochArb,
                inWindowArb,
                inWindowArb,
                (weekly, n, delta1, delta2) => {
                    const t1 = end(n) - delta1;
                    const t2 = end(n + 1) - delta2;
                    const before = acc(term(n, t1, weekly), t2);
                    const after = weekly + acc(term(n + 1, t2, weekly), t2);
                    const gap = t2 - t1;
                    const step = after - before;
                    const expected = (weekly * Math.max(W - gap, 0)) / W;
                    expect(Math.abs(step - expected)).toBeLessThanOrEqual(
                        tol(after),
                    );
                    expect(step).toBeLessThanOrEqual(
                        (weekly * 2) / 7 + tol(after),
                    );
                },
            ),
        );
    });

    it('property: the first late catch-up after an on-time clearing is exactly continuous', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                settledArb,
                epochArb,
                inWindowArb,
                // Below the cap: now − E(n+1) ≤ 3 epochs, so the on-time
                // term (a full epoch plus that) stays within four.
                fc.integer({ min: 0, max: 2 * W }),
                fc.integer({ min: 0, max: W }),
                (weekly, settled, n, delta, lateness, afterwards) => {
                    const onTime = term(n, end(n) - delta, weekly);
                    const catchUpAt = end(n + 1) + lateness;
                    const late = term(n + 1, catchUpAt, weekly);
                    for (const now of [catchUpAt, catchUpAt + afterwards]) {
                        // Before: a full epoch (the hold), then now − E(n+1).
                        // After: one epoch settled, then now − E(n+1).
                        const before = settled + acc(onTime, now);
                        const after = settled + weekly + acc(late, now);
                        expectClose(after, before);
                        expectClose(
                            acc(onTime, now),
                            (weekly * (W + now - end(n + 1))) / W,
                        );
                    }
                },
            ),
        );
    });

    it('property: consecutive late catch-ups keep settled + accrued continuous', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                settledArb,
                epochArb,
                // Below the cap: now − E(n) ≤ 4 epochs.
                fc.integer({ min: 0, max: W }),
                fc.integer({ min: 1, max: 3 }),
                fc.integer({ min: 0, max: W / 2 }),
                fc.integer({ min: 0, max: W / 2 }),
                (weekly, settled, n, lateness, k, catchUpDelay, afterwards) => {
                    const from = term(n, end(n) + lateness, weekly);
                    const catchUpAt =
                        Math.max(end(n + k), end(n) + lateness) + catchUpDelay;
                    const to = term(n + k, catchUpAt, weekly);
                    const now = catchUpAt + afterwards;
                    expectClose(
                        settled + k * weekly + acc(to, now),
                        settled + acc(from, now),
                    );
                },
            ),
        );
    });

    it('property: on time after late steps up by weekly × (E − t) / W ≤ 2/7 weekly', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                epochArb,
                fc.integer({ min: 0, max: W - HOURS_48 }),
                inWindowArb,
                (weekly, n, lateness, delta) => {
                    const late = term(n, end(n) + lateness, weekly);
                    const t = end(n + 1) - delta;
                    const onTime = term(n + 1, t, weekly);
                    const step = weekly + acc(onTime, t) - acc(late, t);
                    expect(
                        Math.abs(step - (weekly * (end(n + 1) - t)) / W),
                    ).toBeLessThanOrEqual(tol(weekly));
                    expect(step).toBeGreaterThan(0);
                    expect(step).toBeLessThanOrEqual(
                        (weekly * 2) / 7 + tol(weekly),
                    );
                },
            ),
        );
    });

    it('property: along any sequence of clearings, gaps past four epochs included, it never steps down, steps up by ≤ 2/7 weekly below the cap and ≤ one weekly at it, and never exceeds settled + 4 weekly', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                settledArb,
                epochArb,
                fc.array(
                    fc.record({
                        late: fc.boolean(),
                        delta: inWindowArb,
                        lateness: fc.integer({ min: 0, max: 10 * W }),
                    }),
                    { minLength: 2, maxLength: 8 },
                ),
                (weekly, settled, n, clearings) => {
                    let previous: EpochAccrual | null = null;
                    let previousAt = Number.NEGATIVE_INFINITY;
                    let base = settled;
                    for (let i = 0; i < clearings.length; i++) {
                        const c = clearings[i];
                        const epochEnd = end(n + i);
                        // In order: a clearing cannot start before the
                        // previous one, which may push it past its epoch end.
                        const at = Math.max(
                            c.late ? epochEnd + c.lateness : epochEnd - c.delta,
                            previousAt,
                        );
                        const next = term(n + i, at, weekly);
                        const ceiling = MAX_ACCRUAL_EPOCHS * weekly;
                        expect(acc(next, at)).toBeLessThanOrEqual(
                            ceiling + tol(ceiling),
                        );
                        if (previous !== null) {
                            const held = acc(previous, at);
                            expect(held).toBeLessThanOrEqual(
                                ceiling + tol(ceiling),
                            );
                            const before = base + held;
                            base += weekly;
                            const after = base + acc(next, at);
                            expect(after).toBeGreaterThanOrEqual(
                                before - tol(before),
                            );
                            expect(after - before).toBeLessThanOrEqual(
                                weekly + tol(before),
                            );
                            if (held < ceiling - tol(ceiling)) {
                                expect(after - before).toBeLessThanOrEqual(
                                    (weekly * 2) / 7 + tol(before),
                                );
                            }
                        }
                        previous = next;
                        previousAt = at;
                    }
                },
            ),
        );
    });

    it('property: never goes backwards in time', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        weeklyInterest: fc.double({
                            min: 0,
                            max: 1e6,
                            noNaN: true,
                            noDefaultInfinity: true,
                        }),
                        epochEnd: fc.integer({
                            min: END_124 - 200 * W,
                            max: END_124 + 200 * W,
                        }),
                        lag: fc.integer({ min: 0, max: 10 * W }),
                    }),
                    { maxLength: 10 },
                ),
                fc.integer({ min: END_124 - 210 * W, max: END_124 + 210 * W }),
                fc.integer({ min: 0, max: 60 * W }),
                (terms, t1, d) => {
                    const accruals = terms.map(
                        ({ weeklyInterest: weekly, epochEnd, lag }) => ({
                            weeklyInterest: weekly,
                            accruesFrom: epochEnd - lag,
                            epochEnd,
                        }),
                    );
                    const atEarlier = accruedInterestSince(accruals, t1);
                    const atLater = accruedInterestSince(accruals, t1 + d);
                    expect(atLater).toBeGreaterThanOrEqual(
                        atEarlier - tol(atEarlier),
                    );
                },
            ),
        );
    });
});

describe('projectedAnnualEarnings', () => {
    it('is amount × net rate', () => {
        expect(projectedAnnualEarnings(1000, 0.1311)).toBeCloseTo(131.1, 10);
        expect(projectedAnnualEarnings(0, 0.2)).toBe(0);
        expect(projectedAnnualEarnings(1000, 0)).toBe(0);
    });

    it('carries an unknown fee straight through as no figure', () => {
        // `netEffectiveApy` fails closed to NaN on an unloaded fee; the
        // projection must not turn that into a number.
        expect(
            projectedAnnualEarnings(1000, netEffectiveApy(0.16, Number.NaN)),
        ).toBeNaN();
        expect(
            projectedAnnualEarnings(1000, netEffectiveApy(0.16, FEE)),
        ).toBeCloseTo(1000 * netEffectiveApy(0.16, FEE), 10);
    });

    it('FAILS CLOSED on a non-finite or negative input', () => {
        expect(projectedAnnualEarnings(Number.NaN, 0.1)).toBeNaN();
        expect(
            projectedAnnualEarnings(Number.POSITIVE_INFINITY, 0.1),
        ).toBeNaN();
        expect(projectedAnnualEarnings(-1, 0.1)).toBeNaN();
        expect(projectedAnnualEarnings(1000, Number.NaN)).toBeNaN();
        expect(projectedAnnualEarnings(1000, -0.01)).toBeNaN();
        expect(
            projectedAnnualEarnings(1000, Number.POSITIVE_INFINITY),
        ).toBeNaN();
    });

    it('is linear in the amount and never negative', () => {
        fc.assert(
            fc.property(
                fc.double({
                    min: 0,
                    max: 1e9,
                    noNaN: true,
                    noDefaultInfinity: true,
                }),
                fc.double({
                    min: 0,
                    max: 1,
                    noNaN: true,
                    noDefaultInfinity: true,
                }),
                (amount, rate) => {
                    const y = projectedAnnualEarnings(amount, rate);
                    expect(y).toBeGreaterThanOrEqual(0);
                    expect(y).toBeLessThanOrEqual(amount + 1e-9);
                },
            ),
        );
    });
});
