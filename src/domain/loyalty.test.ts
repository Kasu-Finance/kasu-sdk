import fc from 'fast-check';

import {
    annualPctOfEpochRate,
    buildLoyaltyStatus,
    formatExactDecimal,
    ksuToLockFor,
    LoyaltyChainState,
    loyaltyLevelOf,
    loyaltyRatioBps,
    MAX_ADDITIONAL_LOYALTY_LEVELS,
    requiredLockedValue,
    requiredRksuFor,
    rKsuValue,
} from './loyalty';

const B = (v: string | number): bigint => BigInt(v);
const E18 = B('1000000000000000000');
const USDC = (whole: number): bigint => B(whole) * B(1_000_000);
const KSU = (whole: number): bigint => B(whole) * E18;

/** Base today: thresholds [100, 500], 0 / 0.1 % / 0.2 % a year, KSU at 2.0. */
const BASE_RATES = [B(0), B('19164956034632'), B('38329912069265')];
const PRICE_2 = B(2) * E18;

function state(over: Partial<LoyaltyChainState> = {}): LoyaltyChainState {
    return {
        thresholdsBps: [B(100), B(500)],
        ksuPrice: PRICE_2,
        rKsu: B(0),
        lockedKsu: B(0),
        activeLent: USDC(10_000),
        pendingLent: B(0),
        pendingLentNextEpoch: B(0),
        epochRewardRates: BASE_RATES,
        stableDecimals: 6,
        ...over,
    };
}

const META = { blockNumber: 123, epoch: 126 };

/**
 * `UserManager._userLoyaltyLevel`, transcribed line for line — the two
 * divisions of `_rKSUInUSDC` kept separate — so `loyaltyLevelOf` is checked
 * against the contract's own order of operations, not against itself.
 */
function contractLevel(
    userRKSU: bigint,
    ksuPrice: bigint,
    activeDepositAmount: bigint,
    pendingDepositAmount: bigint,
    loyaltyThresholds: bigint[],
): number {
    const userDepositAmount = activeDepositAmount + pendingDepositAmount;
    const rKSUInUSDC = (userRKSU * ksuPrice) / E18 / B('1000000000000');
    let rKSUDepositRatio = B(0);
    const MAX = (B(1) << B(256)) - B(1);
    if (userDepositAmount > B(0)) {
        rKSUDepositRatio = (rKSUInUSDC * B(10_000)) / userDepositAmount;
    } else if (userRKSU > B(0)) {
        rKSUDepositRatio = MAX;
    }
    let loyaltyLevel = 0;
    for (const threshold of loyaltyThresholds) {
        if (rKSUDepositRatio >= threshold) loyaltyLevel++;
        else break;
    }
    return loyaltyLevel;
}

describe('formatExactDecimal', () => {
    it.each([
        [B(0), 6, '0'],
        [B(1), 18, '0.000000000000000001'],
        [B(2) * E18, 18, '2'],
        [B(1_500_000), 6, '1.5'],
        [B(-1_500_000), 6, '-1.5'],
        [B(123), 0, '123'],
        [B('100000000000000000000'), 18, '100'],
    ])('%s at %s decimals → %s', (value, decimals, expected) => {
        expect(formatExactDecimal(value, decimals)).toBe(expected);
    });

    it('refuses bad decimals', () => {
        expect(() => formatExactDecimal(B(1), -1)).toThrow(RangeError);
        expect(() => formatExactDecimal(B(1), 1.5)).toThrow(RangeError);
    });
});

describe('the contract rule', () => {
    it('values rKSU like _rKSUInUSDC (floored, 6-decimal stable)', () => {
        expect(rKsuValue(KSU(50), PRICE_2)).toBe(USDC(100));
        // 1 wei of rKSU at 2.0 is worth less than one base unit → 0.
        expect(rKsuValue(B(1), PRICE_2)).toBe(B(0));
        // 0.0000005 rKSU × 2 = 0.000001 USDC exactly.
        expect(rKsuValue(B('500000000000'), PRICE_2)).toBe(B(1));
        expect(rKsuValue(B('499999999999'), PRICE_2)).toBe(B(0));
    });

    it('ratio: floored FULL_PERCENT, max with no deposit and some rKSU, 0 with neither', () => {
        expect(loyaltyRatioBps(KSU(50), PRICE_2, USDC(10_000))).toBe(B(100));
        expect(loyaltyRatioBps(KSU(50), PRICE_2, USDC(10_001))).toBe(B(99));
        expect(loyaltyRatioBps(B(1), PRICE_2, B(0))).toBe('max');
        expect(loyaltyRatioBps(B(0), PRICE_2, B(0))).toBe(B(0));
    });

    it('level: thresholds met in order, stopping at the first miss', () => {
        const t = [B(100), B(500)];
        expect(loyaltyLevelOf(B(0), PRICE_2, USDC(10_000), t)).toBe(0);
        expect(loyaltyLevelOf(KSU(50), PRICE_2, USDC(10_000), t)).toBe(1);
        expect(loyaltyLevelOf(KSU(250), PRICE_2, USDC(10_000), t)).toBe(2);
        expect(loyaltyLevelOf(KSU(10_000), PRICE_2, USDC(10_000), t)).toBe(2);
        // A threshold out of order stops the scan, as the contract's `break` does.
        expect(
            loyaltyLevelOf(KSU(250), PRICE_2, USDC(10_000), [B(600), B(100)]),
        ).toBe(0);
    });

    it('edge: no deposit and some rKSU is the top level, whatever the price', () => {
        expect(loyaltyLevelOf(B(1), PRICE_2, B(0), [B(100), B(500)])).toBe(2);
        expect(loyaltyLevelOf(B(1), B(0), B(0), [B(100), B(500)])).toBe(2);
    });

    it('edge: no deposit and no rKSU is level 0 — unless a threshold is 0', () => {
        expect(loyaltyLevelOf(B(0), PRICE_2, B(0), [B(100), B(500)])).toBe(0);
        expect(loyaltyLevelOf(B(0), PRICE_2, B(0), [B(0), B(500)])).toBe(1);
    });

    it('edge: zero price counts every lock as worth 0 while something is lent', () => {
        expect(loyaltyLevelOf(KSU(1_000_000), B(0), USDC(1), [B(100)])).toBe(0);
        expect(
            loyaltyLevelOf(KSU(1_000_000), B(0), USDC(1), [B(0), B(100)]),
        ).toBe(1);
    });

    it('edge: no thresholds is one level, level 0', () => {
        expect(loyaltyLevelOf(KSU(1), PRICE_2, USDC(1), [])).toBe(0);
    });
});

describe('what a level takes', () => {
    it('Base today, $10,000 lent at 2.0: 50 KASU for 1 %, 250 KASU for 5 %', () => {
        expect(requiredLockedValue(B(100), USDC(10_000))).toBe(USDC(100));
        expect(requiredRksuFor(B(100), USDC(10_000), PRICE_2)).toBe(KSU(50));
        expect(requiredRksuFor(B(500), USDC(10_000), PRICE_2)).toBe(KSU(250));
    });

    it('rounds UP to the smallest amount the contract accepts', () => {
        // 333.333333 USDC × 1 % = 3.33333333 → the contract needs 3.333334.
        const lent = B(333_333_333);
        expect(requiredLockedValue(B(100), lent)).toBe(B(3_333_334));
        // 3.333334 USDC at 3.0 → 1.111111333… rKSU, rounded up to the wei.
        const price = B(3) * E18;
        const r = requiredRksuFor(B(100), lent, price);
        expect(r).toBe(B('1111111333333333334'));
        if (r === null) throw new Error('expected a requirement');
        const req = r;
        expect(loyaltyLevelOf(req, price, lent, [B(100)])).toBe(1);
        expect(loyaltyLevelOf(req - B(1), price, lent, [B(100)])).toBe(0);
    });

    it('threshold 0 needs nothing; no deposit needs 1 wei; zero price is unreachable', () => {
        expect(requiredRksuFor(B(0), USDC(10), PRICE_2)).toBe(B(0));
        expect(requiredRksuFor(B(0), USDC(10), B(0))).toBe(B(0));
        expect(requiredRksuFor(B(100), B(0), PRICE_2)).toBe(B(1));
        expect(requiredRksuFor(B(100), B(0), B(0))).toBe(B(1));
        expect(requiredRksuFor(B(100), USDC(10), B(0))).toBeNull();
        expect(requiredLockedValue(B(100), B(0))).toBe(B(0));
    });

    it('agrees with the contract and is minimal, for any state (property)', () => {
        const big = (max: bigint): fc.Arbitrary<bigint> =>
            fc.bigInt({ min: B(0), max });
        fc.assert(
            fc.property(
                fc
                    .array(fc.integer({ min: 0, max: 20_000 }), {
                        maxLength: MAX_ADDITIONAL_LOYALTY_LEVELS,
                    })
                    .map((xs) => xs.sort((a, b) => a - b).map(B)),
                big(KSU(10_000_000)),
                // Prices from 0 to 1 000, down to the wei.
                fc.oneof(
                    big(B(1000) * E18),
                    fc.constant(B(0)),
                    fc.constant(PRICE_2),
                ),
                big(USDC(100_000_000)),
                big(USDC(1_000_000)),
                (thresholds, rKsu, price, active, pending) => {
                    const lent = active + pending;
                    const level = loyaltyLevelOf(rKsu, price, lent, thresholds);
                    expect(level).toBe(
                        contractLevel(rKsu, price, active, pending, thresholds),
                    );
                    thresholds.forEach((t, i) => {
                        const n = i + 1;
                        const req = requiredRksuFor(t, lent, price);
                        if (req === null) {
                            // Unreachable: no balance meets it.
                            expect(level).toBeLessThan(n);
                            expect(
                                contractLevel(
                                    KSU(1_000_000_000),
                                    price,
                                    active,
                                    pending,
                                    thresholds.slice(0, n),
                                ),
                            ).toBeLessThan(n);
                            return;
                        }
                        // Reached exactly when the balance covers the requirement.
                        expect(rKsu >= req).toBe(level >= n);
                        // The requirement reaches level n…
                        expect(
                            contractLevel(
                                req,
                                price,
                                active,
                                pending,
                                thresholds.slice(0, n),
                            ),
                        ).toBe(n);
                        // …and one wei less does not.
                        if (req > B(0)) {
                            expect(
                                contractLevel(
                                    req - B(1),
                                    price,
                                    active,
                                    pending,
                                    thresholds.slice(0, n),
                                ),
                            ).toBeLessThan(n);
                        }
                    });
                },
            ),
            { numRuns: 2000 },
        );
    });

    it('buildLoyaltyStatus: locking additionalKsu reaches each level now AND at the next clearing, and one wei less misses (property)', () => {
        const units = (decimal: string): bigint => {
            const [whole, frac = ''] = decimal.split('.');
            return B(whole + frac.padEnd(18, '0'));
        };
        const big = (max: bigint): fc.Arbitrary<bigint> =>
            fc.bigInt({ min: B(0), max });
        fc.assert(
            fc.property(
                fc
                    .array(fc.integer({ min: 0, max: 20_000 }), {
                        maxLength: MAX_ADDITIONAL_LOYALTY_LEVELS,
                    })
                    .map((xs) => xs.sort((a, b) => a - b).map(B)),
                big(KSU(1_000_000)),
                fc.oneof(
                    big(B(1000) * E18),
                    fc.constant(B(0)),
                    fc.constant(PRICE_2),
                ),
                big(USDC(10_000_000)),
                big(USDC(1_000_000)),
                // Requests tagged for the next epoch, on top of `pending`.
                fc.oneof(big(USDC(1_000_000)), fc.constant(B(0))),
                (thresholds, rKsu, price, active, pending, extra) => {
                    const pendingNext = pending + extra;
                    const status = buildLoyaltyStatus(
                        state({
                            thresholdsBps: thresholds,
                            epochRewardRates: Array.from(
                                { length: thresholds.length + 1 },
                                () => B(0),
                            ),
                            ksuPrice: price,
                            rKsu,
                            activeLent: active,
                            pendingLent: pending,
                            pendingLentNextEpoch: pendingNext,
                        }),
                        META,
                    );
                    expect(status.level).toBe(
                        contractLevel(rKsu, price, active, pending, thresholds),
                    );
                    for (const entry of status.levels) {
                        if (entry.level === 0 || entry.additionalKsu === null) {
                            continue;
                        }
                        const prefix = thresholds.slice(0, entry.level);
                        const after = rKsu + units(entry.additionalKsu);
                        // Reaches it on today's figures and on the next
                        // clearing's (the larger lent amount).
                        expect(
                            contractLevel(
                                after,
                                price,
                                active,
                                pending,
                                prefix,
                            ),
                        ).toBe(entry.level);
                        expect(
                            contractLevel(
                                after,
                                price,
                                active,
                                pendingNext,
                                prefix,
                            ),
                        ).toBe(entry.level);
                        // Minimal at the requirement basis.
                        if (after > rKsu) {
                            expect(
                                contractLevel(
                                    after - B(1),
                                    price,
                                    active,
                                    pendingNext,
                                    prefix,
                                ),
                            ).toBeLessThan(entry.level);
                        }
                    }
                },
            ),
            { numRuns: 2000 },
        );
    });
});

describe('ksuToLockFor', () => {
    it('at full weight it is the rKSU itself; shorter locks need more, rounded up', () => {
        expect(ksuToLockFor(KSU(50), B(10_000))).toBe(KSU(50));
        expect(ksuToLockFor(KSU(50), B(5_000))).toBe(KSU(100));
        expect(ksuToLockFor(KSU(50), B(500))).toBe(KSU(1_000));
        // 1 wei of rKSU at 5 %: floor(a × 500 / 10 000) ≥ 1 needs a = 20.
        expect(ksuToLockFor(B(1), B(500))).toBe(B(20));
        // 7 wei at 30 %: ceil(70 000 / 3 000) = 24 (23 mints only 6).
        expect(ksuToLockFor(B(7), B(3_000))).toBe(B(24));
    });

    it('nothing needed is 0; a multiplier of 0 can never mint (null)', () => {
        expect(ksuToLockFor(B(0), B(500))).toBe(B(0));
        expect(ksuToLockFor(B(0), B(0))).toBe(B(0));
        expect(ksuToLockFor(B(1), B(0))).toBeNull();
    });

    it("is the smallest amount whose lock mints enough under _lock's floor (property)", () => {
        fc.assert(
            fc.property(
                fc.bigInt({ min: B(1), max: KSU(10_000_000) }),
                fc.bigInt({ min: B(1), max: B(20_000) }),
                (rKsu, multiplier) => {
                    const minted = (amount: bigint): bigint =>
                        (amount * multiplier) / B(10_000);
                    const amount = ksuToLockFor(rKsu, multiplier);
                    if (amount === null) throw new Error('unexpected null');
                    expect(minted(amount) >= rKsu).toBe(true);
                    expect(minted(amount - B(1)) < rKsu).toBe(true);
                },
            ),
            { numRuns: 2000 },
        );
    });
});

describe('annualPctOfEpochRate', () => {
    it('the Base rates are the 0.1 % and 0.2 % they were seeded as (≈, to 1e-14 %)', () => {
        expect(annualPctOfEpochRate(B(0))).toBe('0');
        expect(annualPctOfEpochRate(BASE_RATES[1])).toBe(
            '0.099999999999996823624',
        );
        expect(annualPctOfEpochRate(BASE_RATES[2])).toBe(
            '0.199999999999998865105',
        );
        // 1 % a week → 52.17857 % a year, not compounded.
        expect(annualPctOfEpochRate(E18 / B(100))).toBe('52.17857');
    });
});

describe('buildLoyaltyStatus', () => {
    it('Base today: a $10,000 lender with nothing locked', () => {
        const status = buildLoyaltyStatus(state(), META);
        expect(status).toEqual({
            supported: true,
            blockNumber: 123,
            epoch: 126,
            level: 0,
            levelCount: 3,
            thresholdsBps: [100, 500],
            ratioBps: 0,
            lockedKsu: '0',
            rKsu: '0',
            lockedValueUsd: '0',
            ksuPriceUsd: '2',
            lentUsd: { active: '10000', pending: '0', total: '10000' },
            requirementLentUsd: '10000',
            bonusRatePerLevel: [
                { level: 0, epochRate: '0', annualPct: '0' },
                {
                    level: 1,
                    epochRate: '0.000019164956034632',
                    annualPct: '0.099999999999996823624',
                },
                {
                    level: 2,
                    epochRate: '0.000038329912069265',
                    annualPct: '0.199999999999998865105',
                },
            ],
            levels: [
                {
                    level: 0,
                    thresholdBps: 0,
                    reached: true,
                    requiredLockedValueUsd: '0',
                    additionalLockedValueUsd: '0',
                    requiredRksu: '0',
                    additionalKsu: '0',
                },
                {
                    level: 1,
                    thresholdBps: 100,
                    reached: false,
                    requiredLockedValueUsd: '100',
                    additionalLockedValueUsd: '100',
                    requiredRksu: '50',
                    additionalKsu: '50',
                },
                {
                    level: 2,
                    thresholdBps: 500,
                    reached: false,
                    requiredLockedValueUsd: '500',
                    additionalLockedValueUsd: '500',
                    requiredRksu: '250',
                    additionalKsu: '250',
                },
            ],
        });
    });

    it('part-way: level 1, the shortfall to level 2 is the difference', () => {
        const status = buildLoyaltyStatus(
            state({
                rKsu: KSU(60),
                lockedKsu: KSU(120),
                activeLent: USDC(7_000),
                pendingLent: USDC(3_000),
            }),
            META,
        );
        expect(status.level).toBe(1);
        expect(status.ratioBps).toBe(120);
        expect(status.lockedKsu).toBe('120');
        expect(status.rKsu).toBe('60');
        expect(status.lockedValueUsd).toBe('120');
        expect(status.lentUsd).toEqual({
            active: '7000',
            pending: '3000',
            total: '10000',
        });
        expect(status.levels[1]).toMatchObject({
            reached: true,
            additionalKsu: '0',
            additionalLockedValueUsd: '0',
        });
        expect(status.levels[2]).toMatchObject({
            reached: false,
            requiredLockedValueUsd: '500',
            additionalLockedValueUsd: '380',
            additionalKsu: '190',
        });
    });

    it('no deposit, some rKSU: the top level, ratio null', () => {
        const status = buildLoyaltyStatus(
            state({ rKsu: B(1), activeLent: B(0) }),
            META,
        );
        expect(status.level).toBe(2);
        expect(status.ratioBps).toBeNull();
        expect(
            status.levels.every((l) => l.reached && l.additionalKsu === '0'),
        ).toBe(true);
    });

    it('no deposit, no rKSU: level 0, any rKSU reaches the top', () => {
        const status = buildLoyaltyStatus(state({ activeLent: B(0) }), META);
        expect(status.level).toBe(0);
        expect(status.ratioBps).toBeNull();
        expect(status.levels[1].requiredLockedValueUsd).toBe('0');
        expect(status.levels[1].additionalKsu).toBe('0.000000000000000001');
        expect(status.levels[2].additionalKsu).toBe('0.000000000000000001');
    });

    it('zero price: levels above 0 are unreachable (null), the value needed still shows', () => {
        const status = buildLoyaltyStatus(
            state({ ksuPrice: B(0), rKsu: KSU(1_000) }),
            META,
        );
        expect(status.level).toBe(0);
        expect(status.lockedValueUsd).toBe('0');
        expect(status.ksuPriceUsd).toBe('0');
        expect(status.levels[1]).toMatchObject({
            requiredLockedValueUsd: '100',
            requiredRksu: null,
            additionalKsu: null,
        });
    });

    it('no thresholds: one level', () => {
        const status = buildLoyaltyStatus(
            state({ thresholdsBps: [], rKsu: KSU(5) }),
            META,
        );
        expect(status.level).toBe(0);
        expect(status.levelCount).toBe(1);
        expect(status.levels).toHaveLength(1);
        expect(status.bonusRatePerLevel).toHaveLength(1);
    });

    it('three thresholds give four levels — nothing stops at two', () => {
        const status = buildLoyaltyStatus(
            state({
                thresholdsBps: [B(100), B(500), B(1_000)],
                epochRewardRates: [...BASE_RATES, B('57494868103897')],
                rKsu: KSU(500),
            }),
            META,
        );
        expect(status.levelCount).toBe(4);
        expect(status.level).toBe(3);
        expect(status.levels.map((l) => l.requiredRksu)).toEqual([
            '0',
            '50',
            '250',
            '500',
        ]);
    });

    it('a threshold of 0 is met by everyone', () => {
        const status = buildLoyaltyStatus(
            state({ thresholdsBps: [B(0), B(500)], activeLent: B(0) }),
            META,
        );
        expect(status.level).toBe(1);
        expect(status.levels[1]).toMatchObject({
            reached: true,
            requiredRksu: '0',
        });
    });

    it('refuses a state the contract would not allow', () => {
        expect(() =>
            buildLoyaltyStatus(
                state({ thresholdsBps: [B(500), B(100)] }),
                META,
            ),
        ).toThrow('not ascending');
        expect(() =>
            buildLoyaltyStatus(
                state({
                    thresholdsBps: Array.from({ length: 11 }, (_, i) =>
                        B(i * 100),
                    ),
                    epochRewardRates: Array.from({ length: 12 }, () => B(0)),
                }),
                META,
            ),
        ).toThrow('thresholds');
        expect(() =>
            buildLoyaltyStatus(state({ epochRewardRates: [B(0), B(1)] }), META),
        ).toThrow('rate is missing');
        expect(() => buildLoyaltyStatus(state({ rKsu: B(-1) }), META)).toThrow(
            'negative',
        );
        expect(() =>
            buildLoyaltyStatus(
                state({ thresholdsBps: [B(Number.MAX_SAFE_INTEGER) + B(1)] }),
                META,
            ),
        ).toThrow('out of range');
    });

    it('lent amounts use the deployment decimals; only 6 matches the contract', () => {
        const status = buildLoyaltyStatus(
            state({ activeLent: B(1_234_567), stableDecimals: 6 }),
            META,
        );
        expect(status.lentUsd.total).toBe('1.234567');
        expect(() =>
            buildLoyaltyStatus(state({ stableDecimals: 18 }), META),
        ).toThrow('6-decimal');
    });

    it("requirements use the next clearing's lent amount when it is larger", () => {
        // $10,000 active, $2,000 requested in the clearing window (tagged next
        // epoch): the level counts $10,000 now, the next clearing $12,000.
        const status = buildLoyaltyStatus(
            state({
                rKsu: KSU(55),
                pendingLentNextEpoch: USDC(2_000),
            }),
            META,
        );
        expect(status.level).toBe(1);
        expect(status.ratioBps).toBe(110);
        expect(status.lentUsd.total).toBe('10000');
        expect(status.requirementLentUsd).toBe('12000');
        // Level 1 is reached now, but $12,000 × 1 % = $120 = 60 rKSU at 2.0:
        // 5 more to keep it at the next clearing.
        expect(status.levels[1]).toMatchObject({
            reached: true,
            requiredLockedValueUsd: '120',
            additionalLockedValueUsd: '10',
            requiredRksu: '60',
            additionalKsu: '5',
        });
        expect(status.levels[2]).toMatchObject({
            reached: false,
            requiredRksu: '300',
            additionalKsu: '245',
        });
    });

    it('nothing lent now but a deposit waiting: the requirement is real, not 1 wei', () => {
        const status = buildLoyaltyStatus(
            state({ activeLent: B(0), pendingLentNextEpoch: USDC(1_000) }),
            META,
        );
        expect(status.ratioBps).toBeNull();
        expect(status.level).toBe(0);
        expect(status.levels[1].additionalKsu).toBe('5');
    });

    it('a smaller next-epoch figure never lowers the requirement', () => {
        const status = buildLoyaltyStatus(
            state({ pendingLent: USDC(500), pendingLentNextEpoch: B(0) }),
            META,
        );
        expect(status.requirementLentUsd).toBe('10500');
    });
});
