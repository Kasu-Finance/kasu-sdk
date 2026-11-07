import fc from 'fast-check';

import { apyToEpochRate, netEffectiveApy } from './rates';
import {
    accrualStartTimestamp,
    accruedInterest,
    accruedInterestSince,
    dailyInterest,
    EpochAccrual,
    epochEndTimestamp,
    InterestSlice,
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

describe('accrualStartTimestamp', () => {
    // Base, read on chain and from the subgraph: epochStartTimestamp(0); the
    // ends of epochs 123 and 124; and the two clearings' startTimestamp —
    // epoch 123's 17 s AFTER its epoch ended (late), epoch 124's on
    // Wed 28 Oct 2026 03:53:23 UTC, inside its window (on time).
    const BASE_INITIAL = 1_717_653_600;
    const END_123 = 1_792_648_800;
    const END_124 = 1_793_253_600;
    const E123_CLEARING_START = 1_792_648_817;
    const E124_CLEARING_START = 1_793_159_603;

    it('is the clearing’s own start for an on-time clearing', () => {
        expect(
            accrualStartTimestamp(BASE_INITIAL, 124, E124_CLEARING_START),
        ).toBe(E124_CLEARING_START);
    });

    it('is the epoch end for a late clearing, however late', () => {
        expect(
            accrualStartTimestamp(BASE_INITIAL, 123, E123_CLEARING_START),
        ).toBe(END_123);
        expect(
            accrualStartTimestamp(BASE_INITIAL, 124, END_124 + 10 * 86_400),
        ).toBe(END_124);
        expect(accrualStartTimestamp(BASE_INITIAL, 124, END_124)).toBe(END_124);
    });

    it('returns NaN for an epoch or initial start epochEndTimestamp rejects', () => {
        for (const [initial, epoch] of [
            [BASE_INITIAL, -1],
            [BASE_INITIAL, 1.5],
            [BASE_INITIAL, Number.NaN],
            [0, 124],
            [-1, 124],
            [Number.POSITIVE_INFINITY, 124],
        ]) {
            expect(
                accrualStartTimestamp(initial, epoch, E124_CLEARING_START),
            ).toBeNaN();
        }
    });

    it('returns NaN for a clearing start that is not a finite positive number', () => {
        for (const start of [
            0,
            -1,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ]) {
            expect(accrualStartTimestamp(BASE_INITIAL, 124, start)).toBeNaN();
        }
    });
});

describe('accruedInterestSince', () => {
    const W = SECONDS_PER_WEEK;
    const DAY = 86_400;
    const HOURS_48 = 2 * DAY;
    const BASE_INITIAL = 1_717_653_600;
    /** The end of Base epoch 124 (Thu 29 Oct 2026 06:00 UTC). */
    const END_124 = 1_793_253_600;
    /** Base epoch 124's clearing start, on time (Wed 28 Oct 03:53:23 UTC). */
    const E124_CLEARING_START = 1_793_159_603;
    const WEEKLY = 140;
    const BASE = 1000;

    const one = (accruesFrom: number, weekly = WEEKLY): EpochAccrual[] => [
        { weeklyInterest: weekly, accruesFrom },
    ];

    /** |a − b| within a relative float tolerance. */
    const expectClose = (a: number, b: number): void => {
        expect(Math.abs(a - b)).toBeLessThanOrEqual(
            1e-9 * Math.max(1, Math.abs(a), Math.abs(b)),
        );
    };

    it('accrues from the on-time epoch-124 clearing at 7 Nov 14:00 UTC', () => {
        // 2026-11-07 14:00 UTC; epoch 125's clearing never ran.
        const now = 1_794_060_000;
        const from = accrualStartTimestamp(
            BASE_INITIAL,
            124,
            E124_CLEARING_START,
        );
        expect(from).toBe(E124_CLEARING_START);
        expect(accruedInterestSince(one(from), now)).toBeCloseTo(
            (WEEKLY * (now - E124_CLEARING_START)) / W,
            10,
        );
        // ≈ 1.49 epochs, and past one: no cap.
        expect(accruedInterestSince(one(from), now)).toBeGreaterThan(WEEKLY);
    });

    it('accrues exactly three epochs, uncapped, three weeks after a late anchor', () => {
        const from = accrualStartTimestamp(BASE_INITIAL, 124, END_124 + DAY);
        expect(from).toBe(END_124);
        expect(accruedInterestSince(one(from), END_124 + 3 * W)).toBe(
            3 * WEEKLY,
        );
    });

    it('keeps ticking where the capped figure froze', () => {
        const at = (now: number): number =>
            accruedInterestSince(one(E124_CLEARING_START), now);
        expect(at(END_124 + 10 * DAY + 1) - at(END_124 + 10 * DAY)).toBeCloseTo(
            WEEKLY / W,
            12,
        );
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

    it('accrues each pool from ITS OWN anchor', () => {
        expect(
            accruedInterestSince(
                [
                    { weeklyInterest: 70, accruesFrom: END_124 - 2 * W },
                    { weeklyInterest: 140, accruesFrom: END_124 },
                ],
                END_124 + 3 * DAY,
            ),
        ).toBeCloseTo(70 * (2 + 3 / 7) + 140 * (3 / 7), 10);
    });

    it('starts a deposit accepted at an on-time clearing at exactly 0, never below', () => {
        // A first-time lender: $500k accepted at the epoch-124 clearing, which
        // applied that epoch's interest BEFORE accepting it. Their weekly is
        // today's balance × rate; they have no settled interest yet.
        const weeklyNew = 500_000 * 0.00285 * 0.9;
        const from = accrualStartTimestamp(
            BASE_INITIAL,
            124,
            E124_CLEARING_START,
        );
        const accrued = (now: number): number =>
            accruedInterestSince(one(from, weeklyNew), now);
        expect(accrued(E124_CLEARING_START)).toBe(0);
        for (const now of [
            E124_CLEARING_START + 1,
            E124_CLEARING_START + DAY,
            END_124,
        ]) {
            expect(accrued(now)).toBeGreaterThan(0);
            expect(accrued(now)).toBeCloseTo(
                (weeklyNew * (now - E124_CLEARING_START)) / W,
                10,
            );
        }
        // Anchored on the epoch end instead, the same lender would read
        // negative until Thursday 06:00 — the case this anchor exists for.
        expect((weeklyNew * (E124_CLEARING_START - END_124)) / W).toBeLessThan(
            -100,
        );
    });

    it('a top-up at an on-time clearing does not dip the total', () => {
        // Previous on-time clearing exactly one epoch earlier; the clearing
        // credits `weekly` at the OLD balance, then accepts a top-up.
        const weeklyAfterTopUp = 3 * WEEKLY;
        const before =
            BASE +
            accruedInterestSince(
                one(E124_CLEARING_START - W),
                E124_CLEARING_START,
            );
        const after =
            BASE +
            WEEKLY +
            accruedInterestSince(
                one(E124_CLEARING_START, weeklyAfterTopUp),
                E124_CLEARING_START,
            );
        expect(after).toBe(BASE + WEEKLY);
        expectClose(after, before);
    });

    it('an anchor ahead of the local clock contributes 0, never a negative', () => {
        expect(accruedInterestSince(one(END_124), END_124 - DAY)).toBe(0);
        expect(accruedInterestSince(one(END_124), END_124 - 100 * W)).toBe(0);
    });

    it('drops a non-finite or negative term rather than poisoning the sum', () => {
        expect(
            accruedInterestSince(
                [
                    { weeklyInterest: Number.NaN, accruesFrom: END_124 },
                    {
                        weeklyInterest: Number.POSITIVE_INFINITY,
                        accruesFrom: END_124,
                    },
                    { weeklyInterest: -WEEKLY, accruesFrom: END_124 },
                    { weeklyInterest: WEEKLY, accruesFrom: Number.NaN },
                    {
                        weeklyInterest: WEEKLY,
                        accruesFrom: Number.NEGATIVE_INFINITY,
                    },
                    { weeklyInterest: WEEKLY, accruesFrom: END_124 },
                ],
                END_124 + DAY,
            ),
        ).toBeCloseTo(20, 10);
    });

    it('accrues nothing at a non-finite now, or with no terms', () => {
        for (const now of [
            Number.NaN,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ]) {
            expect(accruedInterestSince(one(END_124), now)).toBe(0);
        }
        expect(accruedInterestSince([], END_124 + DAY)).toBe(0);
    });

    it('property: never negative, for any input', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        weeklyInterest: fc.double(),
                        accruesFrom: fc.double(),
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

    it('property: consecutive late catch-ups keep settled + accrued continuous', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                settledArb,
                epochArb,
                fc.integer({ min: 0, max: 30 * W }),
                fc.integer({ min: 1, max: 20 }),
                fc.integer({ min: 0, max: 30 * W }),
                fc.integer({ min: 0, max: 30 * W }),
                (weekly, settled, n, lateness, k, catchUpDelay, afterwards) => {
                    // Epoch n cleared late; epochs n+1 … n+k are then cleared
                    // late too, each crediting one epoch at the same balance.
                    const from = accrualStartTimestamp(
                        BASE_INITIAL,
                        n,
                        epochEndTimestamp(BASE_INITIAL, n) + lateness,
                    );
                    const catchUpAt =
                        epochEndTimestamp(BASE_INITIAL, n + k) + catchUpDelay;
                    const fromAfter = accrualStartTimestamp(
                        BASE_INITIAL,
                        n + k,
                        catchUpAt,
                    );
                    const now = Math.max(catchUpAt, from) + afterwards;
                    const before =
                        settled + accruedInterestSince(one(from, weekly), now);
                    const after =
                        settled +
                        k * weekly +
                        accruedInterestSince(one(fromAfter, weekly), now);
                    expectClose(after, before);
                },
            ),
        );
    });

    it('property: the first late catch-up after an on-time clearing dips once, by weekly × δ / W ≤ 2/7 weekly', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                settledArb,
                epochArb,
                fc.integer({ min: 1, max: HOURS_48 }),
                fc.integer({ min: 0, max: 30 * W }),
                fc.integer({ min: 0, max: 30 * W }),
                (weekly, settled, n, delta, catchUpDelay, afterwards) => {
                    // Epoch n cleared on time, δ before its end; epoch n+1
                    // is then cleared late.
                    const onTimeAt = epochEndTimestamp(BASE_INITIAL, n) - delta;
                    const from = accrualStartTimestamp(
                        BASE_INITIAL,
                        n,
                        onTimeAt,
                    );
                    expect(from).toBe(onTimeAt);
                    const catchUpAt =
                        epochEndTimestamp(BASE_INITIAL, n + 1) + catchUpDelay;
                    const fromAfter = accrualStartTimestamp(
                        BASE_INITIAL,
                        n + 1,
                        catchUpAt,
                    );
                    const now = catchUpAt + afterwards;
                    const before =
                        settled + accruedInterestSince(one(from, weekly), now);
                    const after =
                        settled +
                        weekly +
                        accruedInterestSince(one(fromAfter, weekly), now);
                    const tolerance = 1e-9 * Math.max(1, before);
                    expect(
                        Math.abs(before - after - (weekly * delta) / W),
                    ).toBeLessThanOrEqual(tolerance);
                    expect(before - after).toBeLessThanOrEqual(
                        (weekly * 2) / 7 + tolerance,
                    );
                },
            ),
        );
    });

    it('property: an on-time clearing moves the total by at most 2/7 of one weekly', () => {
        fc.assert(
            fc.property(
                weeklyArb,
                settledArb,
                epochArb,
                // The previous clearing (of epoch n), on time or late.
                fc.integer({ min: -HOURS_48 + 1, max: W - 1 }),
                fc.integer({ min: 1, max: HOURS_48 }),
                (weekly, settled, n, previousOffset, delta) => {
                    const from = accrualStartTimestamp(
                        BASE_INITIAL,
                        n,
                        epochEndTimestamp(BASE_INITIAL, n) + previousOffset,
                    );
                    // Epoch n+1 cleared on time, δ before its end. A late
                    // previous clearing can only precede it if it ran first.
                    const onTimeAt =
                        epochEndTimestamp(BASE_INITIAL, n + 1) - delta;
                    fc.pre(
                        epochEndTimestamp(BASE_INITIAL, n) + previousOffset <=
                            onTimeAt,
                    );
                    const fromAfter = accrualStartTimestamp(
                        BASE_INITIAL,
                        n + 1,
                        onTimeAt,
                    );
                    expect(fromAfter).toBe(onTimeAt);
                    const before =
                        settled +
                        accruedInterestSince(one(from, weekly), onTimeAt);
                    const after =
                        settled +
                        weekly +
                        accruedInterestSince(one(fromAfter, weekly), onTimeAt);
                    expect(Math.abs(after - before)).toBeLessThanOrEqual(
                        (weekly * 2) / 7 + 1e-9 * Math.max(1, before),
                    );
                },
            ),
        );
    });

    it('property: never goes backwards in time', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: END_124 - 200 * W, max: END_124 + 200 * W }),
                fc.array(
                    fc.record({
                        weeklyInterest: fc.double({
                            min: 0,
                            max: 1e6,
                            noNaN: true,
                            noDefaultInfinity: true,
                        }),
                        lead: fc.integer({ min: -60 * W, max: 60 * W }),
                    }),
                    { maxLength: 10 },
                ),
                fc.integer({ min: 0, max: 60 * W }),
                (t1, terms, d) => {
                    const accruals = terms.map(
                        ({ weeklyInterest: weekly, lead }) => ({
                            weeklyInterest: weekly,
                            accruesFrom: t1 + lead,
                        }),
                    );
                    const atEarlier = accruedInterestSince(accruals, t1);
                    const atLater = accruedInterestSince(accruals, t1 + d);
                    expect(atLater).toBeGreaterThanOrEqual(
                        atEarlier - 1e-9 * Math.max(1, atEarlier),
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
