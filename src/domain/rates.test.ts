import * as fc from 'fast-check';

import {
    apyToEpochRate,
    epochRateToApy,
    EPOCHS_IN_YEAR,
    netEffectiveApy,
} from './rates';

/**
 * Ported from kasu-ui `src/features/lending/lib/interest-rate.test.ts`. The
 * `formatEffectiveRate` cases stay there — they assert copy and locale, which
 * this layer does not own.
 */

/** The live performance fee on all deployments (subgraph units: 10 = ten percent). */
const LIVE_FEE_PERCENT = 10;

/**
 * Spec §9 — every distinct per-epoch rate configured on Base, read on-chain
 * 2026-09-01, with the NET Effective Interest Rate each must display at the
 * live 10% fee. This table IS the review sanity check: a correct
 * implementation reproduces the whole column, including the 30% crossover row
 * (26.30% gross nominal → 26.64% net APY) which moves UP while every other row
 * moves down, because the two errors in the old display — no fee deducted, and
 * a spurious de-compounding — pull in opposite directions and cross over near
 * 28%.
 */
const GROUND_TRUTH: readonly { grossApy: number; netPercent: number }[] = [
    { grossApy: 0.1, netPercent: 8.96 },
    { grossApy: 0.105, netPercent: 9.4 },
    { grossApy: 0.12, netPercent: 10.74 },
    { grossApy: 0.14, netPercent: 12.52 },
    { grossApy: 0.15, netPercent: 13.41 },
    { grossApy: 0.16, netPercent: 14.29 },
    { grossApy: 0.2, netPercent: 17.84 },
    { grossApy: 0.22, netPercent: 19.6 },
    { grossApy: 0.3, netPercent: 26.64 },
];

describe('netEffectiveApy — spec §9 ground truth', () => {
    it.each(GROUND_TRUTH)(
        'gross $grossApy at a 10% fee is $netPercent% net',
        ({ grossApy, netPercent }) => {
            expect(netEffectiveApy(grossApy, LIVE_FEE_PERCENT) * 100).toBeCloseTo(
                netPercent,
                2,
            );
        },
    );

    it('reproduces the 30% crossover — the net APY is ABOVE the old gross nominal figure', () => {
        // Old display: 52.17857 · ((1.30)^(1/52.17857) − 1) = 26.30%. New: 26.64%.
        const oldGrossNominal = EPOCHS_IN_YEAR * (1.3 ** (1 / EPOCHS_IN_YEAR) - 1);
        expect(oldGrossNominal * 100).toBeCloseTo(26.3, 1);
        expect(netEffectiveApy(0.3, LIVE_FEE_PERCENT)).toBeGreaterThan(
            oldGrossNominal,
        );
    });
});

describe('netEffectiveApy — units (spec §2.3)', () => {
    it('reads feePercent as a PERCENTAGE: 22% gross at fee 10 is ≈19.602%', () => {
        expect(netEffectiveApy(0.22, 10)).toBeCloseTo(0.19602, 5);
    });

    it('does not silently accept the 0..1 fraction — 0.1 is a 0.1% fee, not 10%', () => {
        const wrongUnit = netEffectiveApy(0.22, 0.1);
        const correct = netEffectiveApy(0.22, 10);
        // It is a finite, in-range number (we cannot reject it — 0.1% is a
        // legal fee), so the guard cannot catch this. What protects us is that
        // it is MATERIALLY different: ~2.37pp too high, not a plausible
        // near-miss that could sit on screen unnoticed.
        expect(wrongUnit).toBeCloseTo(0.21976, 5);
        expect(wrongUnit - correct).toBeGreaterThan(0.02);
    });

    it('rejects the RAW subgraph integer (1000 = 10%, pre-integerToPercentage2)', () => {
        expect(netEffectiveApy(0.22, 1000)).toBeNaN();
    });

    it('rejects a fee outside 0..100', () => {
        expect(netEffectiveApy(0.22, 101)).toBeNaN();
        expect(netEffectiveApy(0.22, -1)).toBeNaN();
        expect(netEffectiveApy(0.22, NaN)).toBeNaN();
        expect(netEffectiveApy(0.22, Infinity)).toBeNaN();
    });

    it('accepts the domain edges', () => {
        expect(netEffectiveApy(0.22, 0)).toBe(0.22);
        // A 100% fee leaves the lender nothing — 0, not NaN: the fee is
        // knowable and the answer is "you earn zero", which consumers render
        // as "—".
        expect(netEffectiveApy(0.22, 100)).toBe(0);
    });

    it('returns NaN for a non-finite or negative gross APY (callers render "—")', () => {
        expect(netEffectiveApy(NaN, 10)).toBeNaN();
        expect(netEffectiveApy(Infinity, 10)).toBeNaN();
        expect(netEffectiveApy(-Infinity, 10)).toBeNaN();
        expect(netEffectiveApy(-0.01, 10)).toBeNaN();
    });
});

// The FULL in-domain range, down to and including zero and the denormals. The
// invariants below are the reason `netEffectiveApy` is written with
// `log1p`/`expm1`: the direct `(1 + x) ** n - 1` form breaks the `net <= gross`
// invariant for tiny rates, and the property runner finds that in a few hundred
// cases. Narrowing this arb would hide it.
const grossApyArb = fc.double({
    min: 0,
    max: 5,
    noNaN: true,
    noDefaultInfinity: true,
});
const feePercentArb = fc.double({
    min: 0,
    max: 100,
    noNaN: true,
    noDefaultInfinity: true,
});
/**
 * A fee as the subgraph can actually express one: `integerToPercentage2`
 * divides a uint by 100, so every reachable value is a 2dp multiple of 0.01 in
 * 0..100. Used only for the STRICT-decrease property, which cannot hold for a
 * fee of 1e-300 percent — `1 − feePercent/100` rounds to exactly 1 and the net
 * rate is the gross one. That is arithmetic, not a defect, and no such fee
 * exists.
 */
const realisticFeePercentArb = fc
    .integer({ min: 1, max: 10_000 })
    .map((n) => n / 100);

describe('netEffectiveApy — invariants', () => {
    it('never returns more than the gross APY it came from', () => {
        fc.assert(
            fc.property(grossApyArb, feePercentArb, (grossApy, feePercent) => {
                expect(netEffectiveApy(grossApy, feePercent)).toBeLessThanOrEqual(
                    grossApy,
                );
            }),
        );
    });

    it('equals the gross APY EXACTLY when the fee is zero', () => {
        fc.assert(
            // Exact equality, not "close to": if the fee is ever set to zero
            // on-chain, the rate must be the SDK's own APY, with no float drift
            // from the de-compound/re-compound round trip.
            fc.property(grossApyArb, (grossApy) => {
                expect(netEffectiveApy(grossApy, 0)).toBe(grossApy);
            }),
        );
    });

    it('is STRICTLY below the gross APY for any real (2dp) non-zero fee', () => {
        fc.assert(
            fc.property(
                grossApyArb,
                realisticFeePercentArb,
                (grossApy, feePercent) => {
                    if (grossApy === 0) return;
                    expect(netEffectiveApy(grossApy, feePercent)).toBeLessThan(
                        grossApy,
                    );
                },
            ),
        );
    });

    it('decreases monotonically as the fee rises', () => {
        fc.assert(
            fc.property(
                grossApyArb,
                feePercentArb,
                feePercentArb,
                (grossApy, a, b) => {
                    const [lo, hi] = a <= b ? [a, b] : [b, a];
                    expect(netEffectiveApy(grossApy, hi)).toBeLessThanOrEqual(
                        netEffectiveApy(grossApy, lo),
                    );
                },
            ),
        );
    });

    it('increases monotonically as the gross APY rises', () => {
        fc.assert(
            fc.property(
                grossApyArb,
                grossApyArb,
                feePercentArb,
                (a, b, feePercent) => {
                    const [lo, hi] = a <= b ? [a, b] : [b, a];
                    expect(netEffectiveApy(hi, feePercent)).toBeGreaterThanOrEqual(
                        netEffectiveApy(lo, feePercent),
                    );
                },
            ),
        );
    });

    it('is never negative for any in-domain input', () => {
        fc.assert(
            fc.property(grossApyArb, feePercentArb, (grossApy, feePercent) => {
                expect(
                    netEffectiveApy(grossApy, feePercent),
                ).toBeGreaterThanOrEqual(0);
            }),
        );
    });
});

describe('epochRateToApy / apyToEpochRate', () => {
    it('compounds a per-epoch rate exactly as the data service always has', () => {
        // The literal expression `calculateApyForTranche` carried inline.
        for (const r of [0, 0.001, 0.0025, 0.003, 0.005, 0.01]) {
            expect(epochRateToApy(r)).toBe((1 + r) ** EPOCHS_IN_YEAR - 1);
        }
    });

    it('round-trips within 1e-12 for realistic per-epoch rates', () => {
        fc.assert(
            fc.property(
                // 0.0001..0.02 per epoch ≈ 0.5%..190% APY — wider than any
                // rate the platform has configured.
                fc.double({
                    min: 0.0001,
                    max: 0.02,
                    noNaN: true,
                    noDefaultInfinity: true,
                }),
                (r) => {
                    expect(apyToEpochRate(epochRateToApy(r))).toBeCloseTo(r, 12);
                },
            ),
        );
    });

    it('inverts the APYs the platform actually quotes', () => {
        for (const apy of [0.1, 0.12, 0.14, 0.16, 0.22, 0.3]) {
            expect(epochRateToApy(apyToEpochRate(apy))).toBeCloseTo(apy, 12);
        }
    });

    it('is the same de-compounding netEffectiveApy uses at a zero-ish fee', () => {
        // A fee of exactly 0 short-circuits; the smallest fee that does not
        // must still agree with the round trip to well under a basis point.
        const gross = 0.22;
        const net = netEffectiveApy(gross, 0.01);
        expect(net).toBeLessThan(gross);
        expect(gross - net).toBeLessThan(0.0005);
    });
});
