import fc from 'fast-check';

import { apyToEpochRate, netEffectiveApy } from './rates';
import {
    accruedInterest,
    dailyInterest,
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
