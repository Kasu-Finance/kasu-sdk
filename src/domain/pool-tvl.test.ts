import * as fc from 'fast-check';

import {
    combineTvlHistories,
    poolTvl,
    PoolTvlHistoryEntry,
    TvlHistoryInputError,
    TvlHistoryInputErrorCode,
    TvlHistoryLeg,
} from './pool-tvl';

const HOUR = 3_600;
const WEEK = 7 * 24 * HOUR;
/** A Tuesday clearing, unix seconds. Synthetic. */
const T0 = 1_760_000_000;
const AUD_USD = 0.65;

const clearing = (
    epochId: number,
    timestamp: number,
    tvl: number,
): PoolTvlHistoryEntry => ({ epochId, timestamp, tvl, kind: 'clearing' });

const current = (
    epochId: number,
    timestamp: number,
    tvl: number,
): PoolTvlHistoryEntry => ({ epochId, timestamp, tvl, kind: 'current' });

/** Epoch `e` clears at T0 + (e − 90) weeks, plus `offset` seconds. */
const at = (epochId: number, offset = 0): number =>
    T0 + (epochId - 90) * WEEK + offset;

function refusal(run: () => unknown): TvlHistoryInputError {
    try {
        run();
    } catch (error) {
        expect(error).toBeInstanceOf(TvlHistoryInputError);
        return error as TvlHistoryInputError;
    }
    throw new Error('expected combineTvlHistories to throw');
}

const codeOf = (legs: unknown): TvlHistoryInputErrorCode =>
    refusal(() => combineTvlHistories(legs as TvlHistoryLeg[])).code;

describe('poolTvl', () => {
    it('adds the on-chain balance and the off-chain amount', () => {
        expect(poolTvl('1000.5', '250.25')).toBe(1250.75);
        expect(poolTvl('0', '0')).toBe(0);
    });
});

describe('combineTvlHistories — one leg', () => {
    it('is the leg itself in USD, without the epoch', () => {
        const entries = [
            clearing(90, at(90), 100),
            clearing(91, at(91), 150),
            current(92, at(91, 2 * HOUR), 160),
        ];
        expect(combineTvlHistories([{ entries, usdRate: 1 }])).toEqual([
            { timestamp: at(90), tvlUsd: 100, kind: 'clearing' },
            { timestamp: at(91), tvlUsd: 150, kind: 'clearing' },
            { timestamp: at(91, 2 * HOUR), tvlUsd: 160, kind: 'current' },
        ]);
    });

    it('converts a non-USD leg at the rate it is given, every point', () => {
        const entries = [
            clearing(90, at(90), 1_000_000),
            current(91, at(90, HOUR), 2_000_000),
        ];
        expect(
            combineTvlHistories([{ entries, usdRate: AUD_USD }]).map(
                (point) => point.tvlUsd,
            ),
        ).toEqual([650_000, 1_300_000]);
    });

    it('collapses clearings run in one block into one point', () => {
        // A pool catching up four epochs at once: one block, one time, one tvl.
        const entries = [
            clearing(115, at(115), 40),
            clearing(116, at(119), 70),
            clearing(117, at(119), 70),
            clearing(118, at(119), 70),
            clearing(119, at(119), 70),
            current(120, at(120), 75),
        ];
        expect(combineTvlHistories([{ entries, usdRate: 1 }])).toEqual([
            { timestamp: at(115), tvlUsd: 40, kind: 'clearing' },
            { timestamp: at(119), tvlUsd: 70, kind: 'clearing' },
            { timestamp: at(120), tvlUsd: 75, kind: 'current' },
        ]);
    });

    it('ends at the last clearing when the leg has no current point', () => {
        const entries = [clearing(90, at(90), 10), clearing(91, at(91), 20)];
        const combined = combineTvlHistories([{ entries, usdRate: 1 }]);
        expect(combined.map((point) => point.kind)).toEqual([
            'clearing',
            'clearing',
        ]);
    });

    it('keeps a pool that has never cleared as its current point alone', () => {
        expect(
            combineTvlHistories([
                { entries: [current(3, at(90), 5)], usdRate: 1 },
            ]),
        ).toEqual([{ timestamp: at(90), tvlUsd: 5, kind: 'current' }]);
    });
});

describe('combineTvlHistories — two deployments', () => {
    // The shape of Tax Pay: lent on Base, then moving to XDC AUDD, which
    // clears a few hours after Base and first holds funds in epoch 92.
    const XDC_OFFSET = 5 * HOUR;
    const base: TvlHistoryLeg = {
        usdRate: 1,
        entries: [
            clearing(90, at(90), 4_000_000),
            clearing(91, at(91), 4_500_000),
            clearing(92, at(92), 4_900_000),
            clearing(93, at(93), 3_300_000),
            current(94, at(93, 30 * HOUR), 3_280_000),
        ],
    };
    const xdc: TvlHistoryLeg = {
        usdRate: AUD_USD,
        entries: [
            clearing(92, at(92, XDC_OFFSET), 5),
            clearing(93, at(93, XDC_OFFSET), 2_000_000),
            current(94, at(93, 29 * HOUR), 5_000_000),
        ],
    };

    it('steps each leg at its own clearing times', () => {
        expect(combineTvlHistories([base, xdc])).toEqual([
            { timestamp: at(90), tvlUsd: 4_000_000, kind: 'clearing' },
            { timestamp: at(91), tvlUsd: 4_500_000, kind: 'clearing' },
            { timestamp: at(92), tvlUsd: 4_900_000, kind: 'clearing' },
            {
                timestamp: at(92, XDC_OFFSET),
                tvlUsd: 4_900_000 + 5 * AUD_USD,
                kind: 'clearing',
            },
            {
                timestamp: at(93),
                tvlUsd: 3_300_000 + 5 * AUD_USD,
                kind: 'clearing',
            },
            {
                timestamp: at(93, XDC_OFFSET),
                tvlUsd: 3_300_000 + 2_000_000 * AUD_USD,
                kind: 'clearing',
            },
            {
                timestamp: at(93, 30 * HOUR),
                tvlUsd: 3_280_000 + 5_000_000 * AUD_USD,
                kind: 'current',
            },
        ]);
    });

    it('counts a leg as 0 before its first point', () => {
        const combined = combineTvlHistories([base, xdc]);
        const beforeXdc = combined.filter(
            (point) => point.timestamp < at(92, XDC_OFFSET),
        );
        expect(beforeXdc.map((point) => point.tvlUsd)).toEqual([
            4_000_000, 4_500_000, 4_900_000,
        ]);
    });

    it('gives the same series whichever order the legs come in', () => {
        const forwards = combineTvlHistories([base, xdc]);
        const backwards = combineTvlHistories([xdc, base]);
        expect(backwards.map((point) => point.timestamp)).toEqual(
            forwards.map((point) => point.timestamp),
        );
        backwards.forEach((point, index) => {
            expect(point.tvlUsd).toBeCloseTo(forwards[index].tvlUsd, 6);
        });
    });

    it('closes at the latest current time with the sum of the currents', () => {
        const last = combineTvlHistories([base, xdc]).at(-1);
        expect(last).toEqual({
            timestamp: Math.max(at(93, 30 * HOUR), at(93, 29 * HOUR)),
            tvlUsd: 3_280_000 + 5_000_000 * AUD_USD,
            kind: 'current',
        });
    });

    it('merges two chains clearing in the same second into one point', () => {
        const same = (usdRate: number, tvls: number[]): TvlHistoryLeg => ({
            usdRate,
            entries: [
                clearing(90, at(90), tvls[0]),
                clearing(91, at(91), tvls[1]),
                current(92, at(91, HOUR), tvls[2]),
            ],
        });
        expect(
            combineTvlHistories([same(1, [10, 20, 30]), same(0.5, [2, 4, 6])]),
        ).toEqual([
            { timestamp: at(90), tvlUsd: 11, kind: 'clearing' },
            { timestamp: at(91), tvlUsd: 22, kind: 'clearing' },
            { timestamp: at(91, HOUR), tvlUsd: 33, kind: 'current' },
        ]);
    });

    it('holds a lagging chain at its own current point', () => {
        // XDC's subgraph stopped indexing before Base's last clearing: from
        // then on XDC counts at the latest it reported.
        const lagging: TvlHistoryLeg = {
            usdRate: 1,
            entries: [
                clearing(90, at(90, HOUR), 1),
                current(91, at(90, 2 * HOUR), 7),
            ],
        };
        const fresh: TvlHistoryLeg = {
            usdRate: 1,
            entries: [
                clearing(90, at(90), 100),
                clearing(91, at(91), 200),
                current(92, at(91, HOUR), 300),
            ],
        };
        expect(combineTvlHistories([fresh, lagging])).toEqual([
            { timestamp: at(90), tvlUsd: 100, kind: 'clearing' },
            { timestamp: at(90, HOUR), tvlUsd: 101, kind: 'clearing' },
            { timestamp: at(91), tvlUsd: 207, kind: 'clearing' },
            { timestamp: at(91, HOUR), tvlUsd: 307, kind: 'current' },
        ]);
    });

    it('folds a clearing at the closing time into the current point', () => {
        const a: TvlHistoryLeg = {
            usdRate: 1,
            entries: [clearing(90, at(90), 1), current(91, at(91), 2)],
        };
        const b: TvlHistoryLeg = {
            usdRate: 1,
            entries: [clearing(90, at(91), 10), current(91, at(91), 10)],
        };
        expect(combineTvlHistories([a, b])).toEqual([
            { timestamp: at(90), tvlUsd: 1, kind: 'clearing' },
            { timestamp: at(91), tvlUsd: 12, kind: 'current' },
        ]);
    });

    it('does not modify its inputs', () => {
        const legs = [base, xdc].map((leg) =>
            Object.freeze({
                usdRate: leg.usdRate,
                entries: Object.freeze(
                    leg.entries.map((entry) => Object.freeze({ ...entry })),
                ),
            }),
        );
        const before = JSON.stringify(legs);
        combineTvlHistories(Object.freeze(legs));
        expect(JSON.stringify(legs)).toBe(before);
    });
});

describe('combineTvlHistories — the opening value', () => {
    // Both legs cut to their last two clearings. XDC already held 50 before
    // its first windowed point at 900: that clearing is its opening.
    const base: TvlHistoryLeg = {
        usdRate: 1,
        opening: clearing(0, 50, 100),
        entries: [
            clearing(1, 1000, 100),
            clearing(2, 2000, 100),
            current(3, 2500, 100),
        ],
    };
    const xdcEntries = [
        clearing(1, 900, 50),
        clearing(2, 1900, 50),
        current(3, 2500, 50),
    ];

    it('counts a leg at its opening before its first entry', () => {
        const xdc: TvlHistoryLeg = {
            usdRate: 1,
            opening: clearing(0, 1, 50),
            entries: xdcEntries,
        };
        expect(combineTvlHistories([base, xdc])).toEqual([
            { timestamp: 900, tvlUsd: 150, kind: 'clearing' },
            { timestamp: 1000, tvlUsd: 150, kind: 'clearing' },
            { timestamp: 1900, tvlUsd: 150, kind: 'clearing' },
            { timestamp: 2000, tvlUsd: 150, kind: 'clearing' },
            { timestamp: 2500, tvlUsd: 150, kind: 'current' },
        ]);
    });

    it('counts 0 before the first entry without an opening (a genuine late start)', () => {
        const baseLate: TvlHistoryLeg = { ...base, opening: null };
        const xdc: TvlHistoryLeg = { usdRate: 1, entries: xdcEntries };
        expect(combineTvlHistories([baseLate, xdc]).slice(0, 2)).toEqual([
            { timestamp: 900, tvlUsd: 50, kind: 'clearing' },
            { timestamp: 1000, tvlUsd: 150, kind: 'clearing' },
        ]);
    });

    it('converts the opening at the leg’s rate', () => {
        const xdc: TvlHistoryLeg = {
            usdRate: AUD_USD,
            opening: clearing(0, 800, 40),
            entries: [clearing(1, 1500, 60), current(2, 2500, 70)],
        };
        const [first] = combineTvlHistories([base, xdc]);
        expect(first).toEqual({
            timestamp: 1000,
            tvlUsd: 100 + 40 * AUD_USD,
            kind: 'clearing',
        });
    });

    it('never draws the opening as a point', () => {
        const combined = combineTvlHistories([base]);
        expect(combined[0].timestamp).toBe(1000);
        expect(combined.map((p) => p.timestamp)).not.toContain(50);
    });

    it('accepts an opening in the same block as the first entry', () => {
        // A catch-up block: the clearing before the window shares it.
        const leg: TvlHistoryLeg = {
            usdRate: 1,
            opening: clearing(3, 1000, 100),
            entries: [clearing(4, 1000, 100), current(5, 2000, 110)],
        };
        expect(combineTvlHistories([leg])).toHaveLength(2);
    });
});

describe('combineTvlHistories — refused input', () => {
    const good = (): PoolTvlHistoryEntry[] => [
        clearing(90, at(90), 1),
        current(91, at(91), 2),
    ];

    it.each([
        ['no legs', []],
        ['not an array', { entries: good(), usdRate: 1 }],
        ['undefined', undefined],
    ])('refuses %s', (_label, legs) => {
        expect(codeOf(legs)).toBe('legs');
    });

    it.each([
        ['zero', 0],
        ['negative', -0.65],
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['a string', '0.65'],
        ['missing', undefined],
    ])('refuses a rate that is %s, naming the leg', (_label, usdRate) => {
        const error = refusal(() =>
            combineTvlHistories([
                { entries: good(), usdRate: 1 },
                { entries: good(), usdRate: usdRate as number },
            ]),
        );
        expect(error.code).toBe('usd-rate');
        expect(error.leg).toBe(1);
        expect(error.message).toContain('leg 1');
    });

    it('refuses a leg that is not an object', () => {
        expect(codeOf([null])).toBe('leg');
        expect(codeOf([1])).toBe('leg');
    });

    it('refuses entries that are not an array', () => {
        expect(codeOf([{ entries: {}, usdRate: 1 }])).toBe('entries');
        expect(codeOf([{ usdRate: 1 }])).toBe('entries');
    });

    it.each<[string, unknown, TvlHistoryInputErrorCode]>([
        ['null entry', null, 'entry'],
        ['NaN tvl', { ...clearing(90, at(90), NaN) }, 'tvl'],
        ['infinite tvl', { ...clearing(90, at(90), Infinity) }, 'tvl'],
        ['negative tvl', { ...clearing(90, at(90), -1) }, 'tvl'],
        ['string tvl', { ...clearing(90, at(90), 0), tvl: '5' }, 'tvl'],
        ['NaN timestamp', { ...clearing(90, NaN, 1) }, 'timestamp'],
        ['negative timestamp', { ...clearing(90, -1, 1) }, 'timestamp'],
        [
            'missing timestamp',
            { epochId: 90, tvl: 1, kind: 'clearing' },
            'timestamp',
        ],
        [
            'unknown kind',
            { ...clearing(90, at(90), 1), kind: 'snapshot' },
            'kind',
        ],
    ])('refuses a %s, naming the leg and entry', (_label, entry, code) => {
        const error = refusal(() =>
            combineTvlHistories([
                {
                    entries: [
                        clearing(89, at(89), 1),
                        entry as PoolTvlHistoryEntry,
                    ],
                    usdRate: 1,
                },
            ]),
        );
        expect(error.code).toBe(code);
        expect(error.leg).toBe(0);
        expect(error.entry).toBe(1);
    });

    it('refuses timestamps going backwards', () => {
        expect(
            codeOf([
                {
                    entries: [clearing(91, at(91), 1), clearing(90, at(90), 1)],
                    usdRate: 1,
                },
            ]),
        ).toBe('order');
    });

    it('refuses a current point that is not the last', () => {
        expect(
            codeOf([
                {
                    entries: [current(90, at(90), 1), clearing(91, at(91), 1)],
                    usdRate: 1,
                },
            ]),
        ).toBe('current');
        expect(
            codeOf([
                {
                    entries: [current(90, at(90), 1), current(91, at(91), 1)],
                    usdRate: 1,
                },
            ]),
        ).toBe('current');
    });

    it('refuses some legs ending in a current point and others not', () => {
        const error = refusal(() =>
            combineTvlHistories([
                { entries: good(), usdRate: 1 },
                { entries: good(), usdRate: 1 },
                { entries: [clearing(90, at(90), 1)], usdRate: 1 },
            ]),
        );
        expect(error.code).toBe('current');
        expect(error.leg).toBe(2);
    });

    it('refuses a leg with no entries, naming it', () => {
        // A real pool always returns at least its current point; an empty
        // leg would quietly turn the total into one chain's figure.
        const error = refusal(() =>
            combineTvlHistories([
                { entries: good(), usdRate: 1 },
                { entries: [], usdRate: AUD_USD },
            ]),
        );
        expect(error.code).toBe('empty-leg');
        expect(error.leg).toBe(1);
        expect(codeOf([{ entries: [], usdRate: 1 }])).toBe('empty-leg');
    });

    it('refuses a hole in a sparse entries array', () => {
        // eslint-disable-next-line no-sparse-arrays
        const entries = [clearing(90, at(90), 1), , current(91, at(91), 2)];
        const error = refusal(() =>
            combineTvlHistories([
                { entries: entries as PoolTvlHistoryEntry[], usdRate: 1 },
            ]),
        );
        expect(error.code).toBe('entry');
        expect(error.entry).toBe(1);
    });

    it('refuses a hole in a sparse legs array', () => {
        const leg = { entries: good(), usdRate: 1 };
        // eslint-disable-next-line no-sparse-arrays
        const error = refusal(() =>
            combineTvlHistories([leg, , leg] as TvlHistoryLeg[]),
        );
        expect(error.code).toBe('leg');
        expect(error.leg).toBe(1);
    });

    it.each<[string, unknown]>([
        ['not an object', 5],
        ['NaN tvl', clearing(80, at(80), NaN)],
        ['negative tvl', clearing(80, at(80), -1)],
        ['infinite timestamp', clearing(80, Infinity, 1)],
        ['a current point', current(80, at(80), 1)],
        ['an unknown kind', { ...clearing(80, at(80), 1), kind: 'x' }],
        ['newer than the first entry', clearing(95, at(95), 1)],
    ])('refuses an opening that is %s, naming the leg', (_label, opening) => {
        const error = refusal(() =>
            combineTvlHistories([
                { entries: good(), usdRate: 1 },
                {
                    entries: good(),
                    usdRate: 1,
                    opening: opening as PoolTvlHistoryEntry,
                },
            ]),
        );
        expect(error.code).toBe('opening');
        expect(error.leg).toBe(1);
    });

    it('accepts a null or absent opening', () => {
        expect(() =>
            combineTvlHistories([
                { entries: good(), usdRate: 1, opening: null },
                { entries: good(), usdRate: 1 },
            ]),
        ).not.toThrow();
    });

    it('refuses a sum too large to be finite', () => {
        expect(
            codeOf([
                {
                    entries: [clearing(90, at(90), Number.MAX_VALUE)],
                    usdRate: 2,
                },
            ]),
        ).toBe('overflow');
    });

    it('validates every leg before combining any', () => {
        // The bad rate sits after an otherwise combinable leg.
        expect(
            codeOf([
                { entries: good(), usdRate: 1 },
                { entries: good(), usdRate: NaN },
            ]),
        ).toBe('usd-rate');
    });
});

describe('combineTvlHistories — properties', () => {
    /** One leg: ascending times from `start`, optionally a closing current. */
    const legArb = (withCurrent: boolean): fc.Arbitrary<TvlHistoryLeg> =>
        fc
            .record({
                usdRate: fc.double({ min: 0.01, max: 5, noNaN: true }),
                start: fc.integer({ min: T0, max: T0 + 10 * WEEK }),
                steps: fc.array(
                    fc.record({
                        gap: fc.integer({ min: 0, max: 2 * WEEK }),
                        tvl: fc.double({ min: 0, max: 1e9, noNaN: true }),
                    }),
                    { minLength: 1, maxLength: 12 },
                ),
                opening: fc.option(
                    fc.record({
                        lead: fc.integer({ min: 0, max: WEEK }),
                        tvl: fc.double({ min: 0, max: 1e9, noNaN: true }),
                    }),
                    { nil: undefined },
                ),
                closing: fc.record({
                    gap: fc.integer({ min: 0, max: WEEK }),
                    tvl: fc.double({ min: 0, max: 1e9, noNaN: true }),
                }),
            })
            .map(({ usdRate, start, steps, closing, opening }) => {
                let t = start;
                const entries: PoolTvlHistoryEntry[] = steps.map(
                    (step, index) => {
                        t += step.gap;
                        return clearing(index, t, step.tvl);
                    },
                );
                if (withCurrent) {
                    entries.push(
                        current(entries.length, t + closing.gap, closing.tvl),
                    );
                }
                return {
                    usdRate,
                    entries,
                    opening: opening
                        ? clearing(-1, start - opening.lead, opening.tvl)
                        : undefined,
                };
            });

    const legsArb = fc
        .boolean()
        .chain((withCurrent) =>
            fc.array(legArb(withCurrent), { minLength: 1, maxLength: 4 }),
        );

    /**
     * The definition, evaluated directly: each leg's latest entry ≤ t, else
     * its opening, else 0.
     */
    const reference = (legs: TvlHistoryLeg[], t: number): number => {
        let sum = 0;
        for (const leg of legs) {
            const upTo = leg.entries.filter((entry) => entry.timestamp <= t);
            const latest = upTo.at(-1) ?? leg.opening ?? undefined;
            sum += (latest?.tvl ?? 0) * leg.usdRate;
        }
        return sum;
    };

    it('is finite, strictly ascending and equal to the definition', () => {
        fc.assert(
            fc.property(legsArb, (legs) => {
                const combined = combineTvlHistories(legs);
                const start = Math.min(
                    ...legs.map((leg) => leg.entries[0].timestamp),
                );
                combined.forEach((point, index) => {
                    expect(Number.isFinite(point.tvlUsd)).toBe(true);
                    expect(point.tvlUsd).toBeGreaterThanOrEqual(0);
                    expect(point.timestamp).toBeGreaterThanOrEqual(start);
                    if (index > 0) {
                        expect(point.timestamp).toBeGreaterThan(
                            combined[index - 1].timestamp,
                        );
                    }
                    expect(point.tvlUsd).toBe(reference(legs, point.timestamp));
                });
                const clearingTimes = new Set(
                    legs.flatMap((leg) =>
                        leg.entries
                            .filter((entry) => entry.kind === 'clearing')
                            .map((entry) => entry.timestamp),
                    ),
                );
                const hasCurrent = legs.every(
                    (leg) => leg.entries.at(-1)?.kind === 'current',
                );
                const last = combined[combined.length - 1];
                if (hasCurrent) {
                    const closing = Math.max(
                        ...legs.map(
                            (leg) => leg.entries.at(-1)?.timestamp ?? 0,
                        ),
                    );
                    expect(last.kind).toBe('current');
                    expect(last.timestamp).toBe(closing);
                    // Every clearing time before the close is a point.
                    const before = [...clearingTimes].filter(
                        (t) => t < closing,
                    );
                    expect(combined.length).toBe(before.length + 1);
                } else {
                    expect(combined.every((p) => p.kind === 'clearing')).toBe(
                        true,
                    );
                    expect(combined.length).toBe(clearingTimes.size);
                }
            }),
        );
    });
});
