import * as fc from 'fast-check';

import { PoolOverview, TrancheData } from '../services/DataService/types';

import { netEffectiveApy } from './rates';
import {
    compareTrancheSeniority,
    derivePoolStatus,
    MIN_TRANCHE_CAPACITY,
    netTrancheApyBounds,
    pickDefaultTrancheId,
    poolAllTranchesFull,
    trancheApyBounds,
    trancheHasCapacity,
    trancheRiskRank,
} from './tranches';

/**
 * Ported from kasu-ui `pick-default-tranche.test.ts` and the NUMERIC half of
 * `format-tranche-apy.range.test.ts`. The formatting cases — whole-percent
 * rendering, the en-dash shape, the locale table and the "collapse when both
 * bounds print the same" rule — stay in kasu-ui: they are decided on rendered
 * digits, which this layer never produces.
 */

// `id === name` keeps assertions readable; `poolCapacity` drives
// `trancheHasCapacity` (≥ 1 stable unit → selectable).
function tranche(name: string, poolCapacity: string, apy = '0.12'): TrancheData {
    return { id: name, name, apy, poolCapacity } as unknown as TrancheData;
}
function pool(tranches: TrancheData[], enabled = true): PoolOverview {
    return { id: 'p', poolName: 'p', enabled, tranches } as unknown as PoolOverview;
}
function rated(minApy: string, maxApy: string): TrancheData {
    return { minApy, maxApy } as unknown as TrancheData;
}

/** The live performance fee on all deployments (subgraph units: 10 = 10%). */
const FEE = 10;

describe('trancheHasCapacity', () => {
    it('accepts a tranche with at least one whole stable unit left', () => {
        expect(trancheHasCapacity({ poolCapacity: '5000' })).toBe(true);
        expect(
            trancheHasCapacity({ poolCapacity: String(MIN_TRANCHE_CAPACITY) }),
        ).toBe(true);
    });

    it('rejects sub-unit dust, zero and unparseable capacity', () => {
        expect(trancheHasCapacity({ poolCapacity: '0.99' })).toBe(false);
        expect(trancheHasCapacity({ poolCapacity: '0' })).toBe(false);
        expect(
            trancheHasCapacity({ poolCapacity: '1.4551915228366852e-11' }),
        ).toBe(false);
        expect(trancheHasCapacity({ poolCapacity: '' })).toBe(false);
        expect(trancheHasCapacity({ poolCapacity: 'not-a-number' })).toBe(false);
    });

    it('reads the facade tranche shape (availableCapacity) identically', () => {
        // `StrategyTranche` renames the same number; one gate, both shapes.
        expect(trancheHasCapacity({ availableCapacity: '5000' })).toBe(true);
        expect(trancheHasCapacity({ availableCapacity: '0' })).toBe(false);
    });
});

describe('trancheRiskRank / compareTrancheSeniority', () => {
    it('ranks the waterfall safest-first by the RAW name', () => {
        expect(trancheRiskRank(tranche('Senior', '1'))).toBe(0);
        expect(trancheRiskRank(tranche('Mezzanine', '1'))).toBe(1);
        expect(trancheRiskRank(tranche('Junior', '1'))).toBe(2);
    });

    it('is case- and whitespace-insensitive, and sorts unknown names last', () => {
        expect(trancheRiskRank(tranche('  SENIOR ', '1'))).toBe(0);
        expect(trancheRiskRank(tranche('Upper Mezzanine', '1'))).toBe(
            Number.POSITIVE_INFINITY,
        );
    });

    it('sorts Senior → Mezzanine → Junior, keeping ties in input order', () => {
        const tranches = [
            tranche('Junior', '5000'),
            tranche('Tranche B', '5000'),
            tranche('Senior', '5000'),
            tranche('Tranche A', '5000'),
            tranche('Mezzanine', '5000'),
        ];
        expect(
            [...tranches].sort(compareTrancheSeniority).map((t) => t.name),
        ).toEqual([
            'Senior',
            'Mezzanine',
            'Junior',
            'Tranche B',
            'Tranche A',
        ]);
    });
});

describe('pickDefaultTrancheId', () => {
    it('defaults to the lowest-risk tranche (Senior) when all have capacity', () => {
        // Subgraph order is Junior → Mezzanine → Senior; the default must NOT
        // be the highest-risk Junior that sits first (audit 3.2).
        const id = pickDefaultTrancheId(
            pool([
                tranche('Junior', '5000'),
                tranche('Mezzanine', '5000'),
                tranche('Senior', '5000'),
            ]),
        );
        expect(id).toBe('Senior');
    });

    it('picks the lowest-risk tranche that is still AVAILABLE (skips a full Senior)', () => {
        const id = pickDefaultTrancheId(
            pool([
                tranche('Junior', '5000'),
                tranche('Mezzanine', '5000'),
                tranche('Senior', '0'),
            ]),
        );
        expect(id).toBe('Mezzanine');
    });

    it('does not rank by APY — a Senior priced above Mezzanine is still preferred', () => {
        // Real pools can price Senior above Mezzanine; risk is ranked by name,
        // not rate.
        const id = pickDefaultTrancheId(
            pool([
                tranche('Mezzanine', '5000', '0.15'),
                tranche('Senior', '5000', '0.18'),
            ]),
        );
        expect(id).toBe('Senior');
    });

    it('falls back to the lowest-risk tranche when every tranche is full', () => {
        const id = pickDefaultTrancheId(
            pool([tranche('Junior', '0'), tranche('Senior', '0')]),
        );
        expect(id).toBe('Senior');
    });

    it('falls back to the first available tranche when names are unrecognised', () => {
        const id = pickDefaultTrancheId(
            pool([tranche('Tranche B', '5000'), tranche('Tranche A', '5000')]),
        );
        expect(id).toBe('Tranche B');
    });

    it('returns an empty string for a pool with no tranches', () => {
        expect(pickDefaultTrancheId(pool([]))).toBe('');
    });
});

describe('poolAllTranchesFull', () => {
    it('is true when every tranche lacks remaining capacity', () => {
        expect(
            poolAllTranchesFull(
                pool([tranche('Junior', '0'), tranche('Senior', '0')]),
            ),
        ).toBe(true);
    });

    it('is false when at least one tranche still has capacity', () => {
        expect(
            poolAllTranchesFull(
                pool([tranche('Junior', '0'), tranche('Senior', '5000')]),
            ),
        ).toBe(false);
    });

    it('is false for a pool with no tranches (nothing to be full)', () => {
        expect(poolAllTranchesFull(pool([]))).toBe(false);
    });
});

describe('derivePoolStatus', () => {
    it('is "Coming soon" for a pool that is not yet enabled, full or not', () => {
        expect(derivePoolStatus(pool([tranche('Senior', '5000')], false))).toBe(
            'Coming soon',
        );
        expect(derivePoolStatus(pool([tranche('Senior', '0')], false))).toBe(
            'Coming soon',
        );
    });

    it('is "Full" for an enabled pool with no capacity anywhere', () => {
        expect(derivePoolStatus(pool([tranche('Senior', '0')]))).toBe('Full');
    });

    it('is "Live" for an enabled pool with capacity, or with no tranches yet', () => {
        expect(derivePoolStatus(pool([tranche('Senior', '5000')]))).toBe('Live');
        expect(derivePoolStatus(pool([]))).toBe('Live');
    });
});

describe('trancheApyBounds', () => {
    it('spans the lowest minApy and the highest maxApy across tranches', () => {
        expect(
            trancheApyBounds([rated('0.12', '0.12'), rated('0.185', '0.185')]),
        ).toEqual({ min: 0.12, max: 0.185 });
    });

    it('carries a single-option strategy as an equal pair', () => {
        expect(trancheApyBounds([rated('0.1', '0.1')])).toEqual({
            min: 0.1,
            max: 0.1,
        });
    });

    it('skips zero and non-finite rates rather than dragging the range down', () => {
        // A tranche with no fixed-term config must not turn a 10.5% range into
        // 0–10.5%.
        expect(
            trancheApyBounds([rated('0', '0'), rated('0.105', '0.105')]),
        ).toEqual({ min: 0.105, max: 0.105 });
        expect(
            trancheApyBounds([rated('not-a-number', 'x'), rated('0.12', '0.14')]),
        ).toEqual({ min: 0.12, max: 0.14 });
    });

    it('is null when nothing usable remains', () => {
        expect(trancheApyBounds([])).toBeNull();
        expect(trancheApyBounds([rated('0', '0')])).toBeNull();
        expect(trancheApyBounds([rated('-0.1', '-0.1')])).toBeNull();
    });

    it('is null when only ONE side is usable — never half a range', () => {
        expect(trancheApyBounds([rated('0.12', '0')])).toBeNull();
        expect(trancheApyBounds([rated('0', '0.12')])).toBeNull();
    });
});

describe('netTrancheApyBounds', () => {
    it('reproduces the spec §2.5 card range: 14–22% gross is 13–20% net', () => {
        const bounds = netTrancheApyBounds([rated('0.14', '0.22')], FEE);
        expect(bounds).not.toBeNull();
        expect(bounds?.min).toBeCloseTo(0.1252, 4);
        expect(bounds?.max).toBeCloseTo(0.196, 4);
    });

    it('puts each bound through netEffectiveApy and nothing else', () => {
        const bounds = netTrancheApyBounds([rated('0.12', '0.185')], FEE);
        expect(bounds).toEqual({
            min: netEffectiveApy(0.12, FEE),
            max: netEffectiveApy(0.185, FEE),
        });
    });

    it('returns the gross bounds unchanged at a zero fee', () => {
        expect(netTrancheApyBounds([rated('0.14', '0.22')], 0)).toEqual({
            min: 0.14,
            max: 0.22,
        });
    });

    it('FAILS CLOSED on an out-of-domain fee — never the gross range', () => {
        // The raw subgraph integer (1000 = 10%) and a negative fee both land
        // here. A caller that does not KNOW the fee must not call at all;
        // substituting 0 would overstate the rate with nothing saying so.
        expect(netTrancheApyBounds([rated('0.14', '0.22')], 1000)).toBeNull();
        expect(netTrancheApyBounds([rated('0.14', '0.22')], -1)).toBeNull();
        expect(netTrancheApyBounds([rated('0.14', '0.22')], NaN)).toBeNull();
    });

    it('is null when a 100% fee leaves the lender nothing', () => {
        expect(netTrancheApyBounds([rated('0.14', '0.22')], 100)).toBeNull();
    });

    it('is null whenever the gross range is', () => {
        expect(netTrancheApyBounds([], FEE)).toBeNull();
        expect(netTrancheApyBounds([rated('0', '0')], FEE)).toBeNull();
    });

    it('never inverts the range it was given', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0.0001, max: 0.99, noNaN: true }),
                fc.double({ min: 0.0001, max: 0.99, noNaN: true }),
                fc.double({ min: 0, max: 99, noNaN: true }),
                (a, b, feePercent) => {
                    const bounds = netTrancheApyBounds(
                        [
                            rated(
                                String(Math.min(a, b)),
                                String(Math.max(a, b)),
                            ),
                        ],
                        feePercent,
                    );
                    if (!bounds) return;
                    expect(bounds.min).toBeLessThanOrEqual(bounds.max);
                    expect(bounds.min).toBeGreaterThan(0);
                },
            ),
            { numRuns: 2000 },
        );
    });
});
