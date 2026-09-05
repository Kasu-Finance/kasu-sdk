import { PoolOverview, TrancheData } from '../services/DataService/types';

import {
    maxNetRateCeiling,
    pickHighestYieldTranche,
    poolMaxApy,
    selectVisiblePools,
} from './pools';
import { netEffectiveApy } from './rates';

/**
 * Ported from kasu-ui `select-visible-pools.test.ts` and the
 * `pickHighestYieldTranche` / `formatMaxNetRate` cases of
 * `pick-best-tranche.test.ts`. The `formatMaxNetRate` assertions are on the
 * ceiling NUMBER here; their rendered strings stay in kasu-ui.
 */

function tranche(
    name: string,
    apy: string,
    poolCapacity: string,
    maxApy?: string,
): TrancheData {
    return { id: name, name, apy, poolCapacity, maxApy } as unknown as TrancheData;
}

function pool(over: Partial<PoolOverview>): PoolOverview {
    return {
        id: 'p',
        poolName: 'p',
        isActive: true,
        isOversubscribed: false,
        tranches: [tranche('Senior', '0.09', '250000', '0.10')],
        ...over,
    } as unknown as PoolOverview;
}

const withCapacity = (): TrancheData[] => [
    tranche('Senior', '0.09', '250000', '0.10'),
];
const noCapacity = (): TrancheData[] => [tranche('Senior', '0.09', '0', '0.10')];

/** The live performance fee on all deployments. */
const FEE = 10;

describe('poolMaxApy', () => {
    it('takes the highest usable maxApy across tranches', () => {
        expect(
            poolMaxApy(
                pool({
                    tranches: [
                        tranche('Senior', '0.09', '1', '0.10'),
                        tranche('Junior', '0.12', '1', '0.18'),
                    ],
                }),
            ),
        ).toBe(0.18);
    });

    it('is 0 when nothing is usable', () => {
        expect(poolMaxApy(pool({ tranches: [] }))).toBe(0);
        expect(
            poolMaxApy(pool({ tranches: [tranche('Senior', '0.09', '1', 'x')] })),
        ).toBe(0);
    });
});

describe('selectVisiblePools', () => {
    it('drops inactive pools', () => {
        const pools = [
            pool({ id: 'active', isActive: true }),
            pool({ id: 'inactive', isActive: false }),
        ];
        expect(selectVisiblePools(pools).map((p) => p.id)).toEqual(['active']);
    });

    it('drops oversubscribed pools', () => {
        const pools = [
            pool({ id: 'open', isOversubscribed: false }),
            pool({ id: 'full', isOversubscribed: true }),
        ];
        expect(selectVisiblePools(pools).map((p) => p.id)).toEqual(['open']);
    });

    it('sorts pools with capacity ahead of pools without', () => {
        const pools = [
            pool({ id: 'empty', tranches: noCapacity() }),
            pool({ id: 'has-cap', tranches: withCapacity() }),
        ];
        expect(selectVisiblePools(pools).map((p) => p.id)).toEqual([
            'has-cap',
            'empty',
        ]);
    });

    it('sorts by highest max APY within the same capacity bucket', () => {
        const pools = [
            pool({
                id: 'low',
                tranches: [tranche('Senior', '0.08', '250000', '0.08')],
            }),
            pool({
                id: 'high',
                tranches: [tranche('Senior', '0.15', '250000', '0.15')],
            }),
        ];
        expect(selectVisiblePools(pools).map((p) => p.id)).toEqual([
            'high',
            'low',
        ]);
    });

    it('does not mutate the input array', () => {
        const pools = [
            pool({ id: 'a', tranches: noCapacity() }),
            pool({ id: 'b', tranches: withCapacity() }),
        ];
        const before = pools.map((p) => p.id);
        selectVisiblePools(pools);
        expect(pools.map((p) => p.id)).toEqual(before);
    });
});

describe('pickHighestYieldTranche', () => {
    const named = (poolName: string, tranches: TrancheData[]): PoolOverview =>
        pool({ id: poolName, poolName, tranches });

    it('returns null for empty / nullish input', () => {
        expect(pickHighestYieldTranche(undefined)).toBeNull();
        expect(pickHighestYieldTranche(null)).toBeNull();
        expect(pickHighestYieldTranche([])).toBeNull();
    });

    it('picks the highest base APY across all pools with capacity', () => {
        const best = pickHighestYieldTranche([
            named('A', [tranche('Junior', '0.12', '5000')]),
            named('B', [
                tranche('Senior', '0.18', '5000'),
                tranche('Mezz', '0.15', '5000'),
            ]),
        ]);
        expect(best?.pool.poolName).toBe('B');
        expect(best?.tranche.name).toBe('Senior');
        expect(best?.apy).toBeCloseTo(0.18);
    });

    it('skips tranches without capacity (< 1 unit)', () => {
        const best = pickHighestYieldTranche([
            named('Full', [tranche('Junior', '0.30', '0')]),
            named('Live', [tranche('Senior', '0.10', '2000')]),
        ]);
        expect(best?.pool.poolName).toBe('Live');
        expect(best?.apy).toBeCloseTo(0.1);
    });

    it('breaks APY ties toward more remaining capacity', () => {
        const best = pickHighestYieldTranche([
            named('Small', [tranche('Junior', '0.15', '1000')]),
            named('Big', [tranche('Junior', '0.15', '9000')]),
        ]);
        expect(best?.pool.poolName).toBe('Big');
    });

    it('ignores zero / non-finite APY values', () => {
        const best = pickHighestYieldTranche([
            named('Zero', [tranche('Junior', '0', '5000')]),
            named('NaN', [tranche('Junior', 'not-a-number', '5000')]),
            named('Real', [tranche('Junior', '0.09', '5000')]),
        ]);
        expect(best?.pool.poolName).toBe('Real');
    });

    it('reads the BASE rate, not the FTD-widened maxApy', () => {
        // A ceiling claim and a named tranche's rate are different statements.
        const best = pickHighestYieldTranche([
            named('A', [tranche('Junior', '0.12', '5000', '0.30')]),
            named('B', [tranche('Senior', '0.18', '5000', '0.18')]),
        ]);
        expect(best?.pool.poolName).toBe('B');
    });
});

describe('maxNetRateCeiling', () => {
    const named = (poolName: string, tranches: TrancheData[]): PoolOverview =>
        pool({ id: poolName, poolName, tranches });

    it('returns the highest ceiling across all pools, net of the fee', () => {
        const rate = maxNetRateCeiling(
            [
                named('A', [tranche('Junior', '0.12', '5000', '0.18')]),
                named('B', [tranche('Senior', '0.10', '5000', '0.22')]),
            ],
            FEE,
        );
        // 0.22 gross → 19.60% net, the same arithmetic as everywhere else.
        expect(rate).toBe(netEffectiveApy(0.22, FEE));
        expect(rate).toBeCloseTo(0.196, 4);
    });

    it('prefers the FTD-inclusive maxApy over the base rate', () => {
        // The strategies card's range tops out at maxApy; an "up to" claim
        // quoting the base rate would contradict it on the same screen.
        expect(
            maxNetRateCeiling(
                [named('A', [tranche('Junior', '0.10', '5000', '0.22')])],
                FEE,
            ),
        ).toBe(netEffectiveApy(0.22, FEE));
    });

    it('falls back to the base rate when a tranche carries no maxApy', () => {
        expect(
            maxNetRateCeiling(
                [named('A', [tranche('Junior', '0.22', '5000')])],
                FEE,
            ),
        ).toBe(netEffectiveApy(0.22, FEE));
    });

    it('skips tranches without capacity — an unreachable rate is not a claim', () => {
        const rate = maxNetRateCeiling(
            [
                named('Full', [tranche('Junior', '0.30', '0', '0.30')]),
                named('Live', [tranche('Senior', '0.10', '5000', '0.10')]),
            ],
            FEE,
        );
        expect(rate).toBe(netEffectiveApy(0.1, FEE));
        expect(rate).toBeCloseTo(0.0896, 4);
    });

    it('returns null rather than a gross figure when the fee is out of domain', () => {
        const pools = [named('A', [tranche('Junior', '0.22', '5000', '0.22')])];
        expect(maxNetRateCeiling(pools, 1000)).toBeNull();
        expect(maxNetRateCeiling(pools, -1)).toBeNull();
        expect(maxNetRateCeiling(pools, NaN)).toBeNull();
        // A 100% fee leaves nothing to claim.
        expect(maxNetRateCeiling(pools, 100)).toBeNull();
    });

    it('returns null for empty, nullish or rate-less input', () => {
        expect(maxNetRateCeiling(undefined, FEE)).toBeNull();
        expect(maxNetRateCeiling(null, FEE)).toBeNull();
        expect(maxNetRateCeiling([], FEE)).toBeNull();
        expect(
            maxNetRateCeiling(
                [named('Zero', [tranche('Junior', '0', '5000', '0')])],
                FEE,
            ),
        ).toBeNull();
    });

    it('agrees with the top of the tranche range it must sit alongside', () => {
        // Both read maxApy through netEffectiveApy; they must not disagree.
        const tranches = [tranche('Senior', '0.14', '5000', '0.22')];
        expect(maxNetRateCeiling([named('A', tranches)], FEE)).toBe(
            netEffectiveApy(0.22, FEE),
        );
    });
});
