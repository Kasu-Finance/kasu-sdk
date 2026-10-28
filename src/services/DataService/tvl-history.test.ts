import { BigNumber, providers, Wallet } from 'ethers';

import { poolTvl, PoolTvlHistoryEntry } from '../../domain/pool-tvl';
import { CHAIN_CONFIGS } from '../../facade/chain-configs';
import { Kasu } from '../../facade/kasu';
import { SdkConfig } from '../../sdk-config';

import { DataService, NO_HISTORY_PROVIDER_MESSAGE } from './data-service';
import {
    fetchPoolBalancesAtBlocks,
    firstBlockWithCode,
    mapWithConcurrency,
    OffChainTvlReader,
    poolBalancesAtBlocksQuery,
    poolTvlClearingsQuery,
    resolvePoolTvlHistoryWindow,
    retryingReader,
    TVL_HISTORY_BLOCKS_PER_REQUEST,
    TVL_HISTORY_RPC_CONCURRENCY,
} from './tvl-history';

// ---------------------------------------------------------------------------
// A synthetic chain, and an emulator that answers the clearings query, the
// time-travel query and the pool-overview query from it, plus an ExternalTVL
// reader with a deployment block. Every address is synthetic, every amount a
// round number; the off-chain TVL is in BASE units (6 decimals).
// ---------------------------------------------------------------------------

const POOL_A = '0x000000000000000000000000000000000000a001';
const POOL_XDC = '0x000000000000000000000000000000000000c001';
const POOL_STALLED = '0x000000000000000000000000000000000000d001';
const UNKNOWN_POOL = '0x000000000000000000000000000000000000e001';

const T0 = 1_700_000_000;
const WEEK = 604_800;

interface ClearingState {
    epochId: number;
    block: number;
    timestamp: number;
}

interface PoolState {
    id: string;
    clearings: ClearingState[];
    /** On-chain balance (display units) from each block on. */
    balanceSteps: [block: number, balance: string][];
    balanceNow: string;
}

interface ChainState {
    currentEpoch: number;
    latestBlock: number;
    latestTime: number | null;
    pools: PoolState[];
    /** First block with ExternalTVL code. */
    externalDeployedAt: number;
    /** Off-chain TVL (6dp BASE units) from each block on, per pool. */
    offChainSteps: Record<string, [block: number, base: number][]>;
    offChainNow: Record<string, number>;
}

/**
 * - POOL_A (Base-like): epochs 2 and 3 cleared in the SAME block, an
 *   off-chain amount that appears and is later removed, a contract deployed
 *   between two clearings, and a clearing for the CURRENT epoch (6).
 * - POOL_XDC: the first clearing is numbered 1, a week before epoch 88.
 * - POOL_STALLED: epochs 3–5 in one catch-up block, nothing since.
 */
function chain(): ChainState {
    return {
        currentEpoch: 6,
        latestBlock: 900,
        latestTime: T0 + 10 * WEEK,
        externalDeployedAt: 250,
        pools: [
            {
                id: POOL_A,
                clearings: [
                    { epochId: 2, block: 100, timestamp: T0 },
                    { epochId: 3, block: 100, timestamp: T0 },
                    { epochId: 4, block: 200, timestamp: T0 + WEEK },
                    { epochId: 5, block: 300, timestamp: T0 + 2 * WEEK },
                    { epochId: 6, block: 400, timestamp: T0 + 3 * WEEK },
                ],
                balanceSteps: [
                    [100, '1000000'],
                    [200, '1002413.909756'],
                    [300, '1500000'],
                    [400, '1250000.5'],
                ],
                balanceNow: '1250000.5',
            },
            {
                id: POOL_XDC,
                clearings: [
                    { epochId: 1, block: 500, timestamp: T0 + 4 * WEEK },
                    { epochId: 4, block: 600, timestamp: T0 + 5 * WEEK },
                    { epochId: 5, block: 700, timestamp: T0 + 6 * WEEK },
                ],
                balanceSteps: [
                    [500, '5'],
                    [600, '2000000'],
                    [700, '2634498.837975'],
                ],
                balanceNow: '2634498.837975',
            },
            {
                id: POOL_STALLED,
                clearings: [
                    { epochId: 3, block: 350, timestamp: T0 + 2 * WEEK + 1 },
                    { epochId: 4, block: 350, timestamp: T0 + 2 * WEEK + 1 },
                    { epochId: 5, block: 350, timestamp: T0 + 2 * WEEK + 1 },
                ],
                balanceSteps: [[350, '1522520.916665']],
                balanceNow: '1522520.916665',
            },
        ],
        offChainSteps: {
            [POOL_A]: [
                [250, 0],
                [300, 859_855_282_916],
                [400, 0],
            ],
            [POOL_XDC]: [
                [250, 1_500_000_000_000],
                [650, 3_200_000_000_000],
            ],
            [POOL_STALLED]: [[250, 0]],
        },
        offChainNow: {
            [POOL_A]: 250_000_000,
            [POOL_XDC]: 3_200_000_000_000,
            [POOL_STALLED]: 0,
        },
    };
}

function stepAt<T>(steps: [number, T][], block: number): T | undefined {
    let found: T | undefined;
    for (const [from, value] of steps) if (from <= block) found = value;
    return found;
}

interface Harness {
    service: DataService;
    graph: jest.Mock;
    reads: { readAt: (number | 'latest')[]; hasCodeAt: number[] };
    maxInFlight: () => number;
    currentEpochReads: jest.Mock;
}

type GraphOverride = (
    document: string,
    variables: Record<string, unknown>,
) => unknown;

function harness(
    state: ChainState,
    {
        lite = false,
        graphOverride,
        readAtOverride,
    }: {
        lite?: boolean;
        graphOverride?: GraphOverride;
        readAtOverride?: (block: number | 'latest') => Promise<BigNumber>;
    } = {},
): Harness {
    const config = new SdkConfig({
        subgraphUrl: 'https://example.invalid/subgraph',
        contracts: CHAIN_CONFIGS.base.contracts,
        UNUSED_LENDING_POOL_IDS: [],
        isLiteDeployment: lite,
        stableAssetDecimals: 6,
    });
    const service = new DataService(
        config,
        new providers.StaticJsonRpcProvider(
            'https://example.invalid/rpc',
            8453,
        ),
    );

    const poolOf = (id: unknown): PoolState | undefined =>
        state.pools.find((p) => p.id === id);

    const graph = jest.fn(
        (document: string, variables: Record<string, unknown>) => {
            if (graphOverride) {
                const out = graphOverride(document, variables);
                if (out !== undefined) return Promise.resolve(out);
            }
            if (document === poolTvlClearingsQuery) {
                const pool = poolOf(variables.poolId);
                const from = Number(variables.fromEpoch);
                const first = Number(variables.first);
                const clearings = (pool?.clearings ?? [])
                    .filter((c) => c.epochId >= from)
                    .sort((a, b) => a.epochId - b.epochId)
                    .slice(0, first)
                    .map((c) => ({
                        epochId: String(c.epochId),
                        endBlockNumber: String(c.block),
                        endTimestamp: String(c.timestamp),
                    }));
                return Promise.resolve({
                    clearings,
                    ...(variables.withSnapshot
                        ? {
                              pool: pool ? { balance: pool.balanceNow } : null,
                              meta: {
                                  block: {
                                      number: state.latestBlock,
                                      timestamp: state.latestTime,
                                  },
                              },
                          }
                        : {}),
                });
            }
            if (document.startsWith('query PoolTvlAtBlocks')) {
                const pool = poolOf(variables.poolId);
                const out: Record<string, { balance: string } | null> = {};
                for (const [, alias, block] of document.matchAll(
                    /(b\d+): lendingPool\(id: \$poolId, block: \{ number: (\d+) \}\)/g,
                )) {
                    const balance = pool
                        ? stepAt(pool.balanceSteps, Number(block))
                        : undefined;
                    out[alias] = balance === undefined ? null : { balance };
                }
                return Promise.resolve(out);
            }
            if (document.includes('getAllPoolOverview')) {
                return Promise.resolve({
                    lendingPools: state.pools.map((p) => ({
                        id: p.id,
                        totalUserInterestAmount: '0',
                        totalLossAmount: '0',
                        name: p.id,
                        balance: p.balanceNow,
                        firstLostCapital: '0',
                        isStopped: false,
                        pendingPool: {
                            id: p.id,
                            totalPendingDepositAmounts: ['0'],
                            totalPendingDepositsAmount: '0',
                            totalPendingWithdrawalShares: ['0'],
                        },
                        tranches: [
                            {
                                balance: p.balanceNow,
                                id: `${p.id}-0`,
                                totalInterestAmount: '0',
                                orderId: '0',
                                lendingPool: { id: p.id },
                            },
                        ],
                        configuration: {
                            desiredDrawAmount: '10000000',
                            tranchesConfig: [
                                {
                                    id: `${p.id}-0`,
                                    desiredRatio: '100',
                                    interestRate: '0.002',
                                    minDepositAmount: '1',
                                    maxDepositAmount: '1000000',
                                    lendingPoolTrancheInterestRateUpdates: [
                                        { epochInterestRate: '0.002' },
                                    ],
                                    lendingPoolTrancheFixedTermConfigs: [],
                                },
                            ],
                            lendingPoolWithdrawalConfig: {
                                requestEpochsInAdvance: '1',
                            },
                        },
                    })),
                });
            }
            return Promise.reject(
                new Error(`unexpected query: ${document.slice(0, 40)}`),
            );
        },
    );

    const reads = {
        readAt: [] as (number | 'latest')[],
        hasCodeAt: [] as number[],
    };
    let inFlight = 0;
    let peak = 0;
    const offChainAt = (poolId: string, block: number | 'latest'): BigNumber =>
        BigNumber.from(
            block === 'latest'
                ? state.offChainNow[poolId]
                : (stepAt(state.offChainSteps[poolId] ?? [], block) ?? 0),
        );

    const internals = service as unknown as {
        _graph: unknown;
        _systemVariablesAbi: unknown;
        _externalTvlAbi: unknown;
        _offChainTvlReader: (poolId: string) => OffChainTvlReader | null;
    };
    internals._graph = { request: graph };
    const currentEpochReads = jest.fn(() =>
        Promise.resolve(BigNumber.from(state.currentEpoch)),
    );
    internals._systemVariablesAbi = { currentEpochNumber: currentEpochReads };
    internals._externalTvlAbi = {
        externalTVLOfPool: (poolId: string) =>
            Promise.resolve(offChainAt(poolId, 'latest')),
    };
    internals._offChainTvlReader = (poolId: string): OffChainTvlReader => ({
        readAt: async (block: number | 'latest'): Promise<BigNumber> => {
            reads.readAt.push(block);
            inFlight += 1;
            peak = Math.max(peak, inFlight);
            await new Promise((resolve) => setTimeout(resolve, 1));
            inFlight -= 1;
            if (readAtOverride) return readAtOverride(block);
            if (block !== 'latest' && block < state.externalDeployedAt) {
                // What a real node does before the contract existed —
                // the history must never get here.
                throw new Error('call revert exception; data="0x"');
            }
            return offChainAt(poolId, block);
        },
        hasCodeAt: (block: number): Promise<boolean> => {
            reads.hasCodeAt.push(block);
            return Promise.resolve(block >= state.externalDeployedAt);
        },
    });

    return {
        service,
        graph,
        reads,
        maxInFlight: () => peak,
        currentEpochReads,
    };
}

const clearingPoints = (h: PoolTvlHistoryEntry[]): PoolTvlHistoryEntry[] =>
    h.filter((p) => p.kind === 'clearing');

// ---------------------------------------------------------------------------

describe('getPoolTvlHistory — the last point is the current TVL', () => {
    // No CMS in the emulator: getPoolOverview warns per pool; keep it quiet.
    beforeEach(() =>
        jest.spyOn(console, 'warn').mockImplementation(() => undefined),
    );
    afterEach(() => jest.restoreAllMocks());

    it.each([POOL_A, POOL_XDC, POOL_STALLED])(
        '%s: the closing point equals getPoolOverview totalValueLocked.total',
        async (poolId) => {
            const { service } = harness(chain());
            const [history, overviews] = await Promise.all([
                service.getPoolTvlHistory(poolId),
                service.getPoolOverview('6'),
            ]);
            const overview = overviews.find((o) => o.id === poolId);
            const last = history.at(-1);
            expect(last?.kind).toBe('current');
            expect(last?.tvl).toBe(
                parseFloat(overview?.totalValueLocked.total ?? 'NaN'),
            );
        },
    );

    it('pins the closing figures by hand, so parity cannot hold on a shared mistake', async () => {
        const { service } = harness(chain());
        const a = await service.getPoolTvlHistory(POOL_A);
        const xdc = await service.getPoolTvlHistory(POOL_XDC);
        expect(a.at(-1)).toEqual({
            epochId: 6,
            timestamp: T0 + 10 * WEEK,
            tvl: 1_250_250.5,
            kind: 'current',
        });
        expect(xdc.at(-1)?.tvl).toBeCloseTo(5_834_498.837975, 6);
    });

    it('getPoolOverview and the history share one definition: poolTvl', () => {
        expect(poolTvl('1000.5', '250')).toBe(1250.5);
        expect(poolTvl('2634498.837975', '3200000.0')).toBeCloseTo(
            5_834_498.837975,
            6,
        );
    });
});

describe('getPoolTvlHistory — clearing points', () => {
    it('each point is the on-chain balance plus the off-chain TVL AT its block', async () => {
        const { service } = harness(chain());
        const points = clearingPoints(await service.getPoolTvlHistory(POOL_A));
        expect(points.map((p) => [p.epochId, p.tvl])).toEqual([
            [2, 1_000_000],
            [3, 1_000_000],
            [4, 1_002_413.909756],
            // 859,855.282916 off-chain at block 300, gone again by 400.
            [5, 1_500_000 + 859_855.282916],
            [6, 1_250_000.5],
        ]);
        expect(points.every((p) => p.kind === 'clearing')).toBe(true);
    });

    it('dates each point by the block its clearing finished in (unix seconds)', async () => {
        const { service } = harness(chain());
        const points = clearingPoints(await service.getPoolTvlHistory(POOL_A));
        expect(points.map((p) => p.timestamp)).toEqual([
            T0,
            T0,
            T0 + WEEK,
            T0 + 2 * WEEK,
            T0 + 3 * WEEK,
        ]);
    });

    it('a clearing for the current epoch and the closing point both carry it', async () => {
        const { service } = harness(chain());
        const history = await service.getPoolTvlHistory(POOL_A);
        expect(history.slice(-2).map((p) => [p.epochId, p.kind])).toEqual([
            [6, 'clearing'],
            [6, 'current'],
        ]);
    });

    it('is empty for a pool the subgraph does not know', async () => {
        const { service } = harness(chain());
        await expect(service.getPoolTvlHistory(UNKNOWN_POOL)).resolves.toEqual(
            [],
        );
    });

    it('a pool with no clearing yet is just the closing point', async () => {
        const state = chain();
        state.pools[0].clearings = [];
        const { service, reads } = harness(state);
        const history = await service.getPoolTvlHistory(POOL_A);
        expect(history.map((p) => p.kind)).toEqual(['current']);
        expect(reads.hasCodeAt).toEqual([]);
        expect(reads.readAt).toEqual(['latest']);
    });

    it('lowercases the pool id it asks for', async () => {
        const { service, graph } = harness(chain());
        await service.getPoolTvlHistory(
            POOL_A.toUpperCase().replace('0X', '0x'),
        );
        for (const [, variables] of graph.mock.calls as [
            string,
            Record<string, unknown>,
        ][]) {
            expect(variables.poolId).toBe(POOL_A);
        }
    });
});

describe('getPoolTvlHistory — the off-chain TVL before its contract existed', () => {
    it('is 0 by getCode, without an externalTVLOfPool read at those blocks', async () => {
        const { service, reads } = harness(chain());
        const points = clearingPoints(await service.getPoolTvlHistory(POOL_A));
        expect(points[0].tvl).toBe(1_000_000);
        // Blocks 100 and 200 predate the contract (deployed at 250).
        expect(reads.readAt).not.toContain(100);
        expect(reads.readAt).not.toContain(200);
        expect(reads.hasCodeAt.length).toBeGreaterThan(0);
    });

    it('a failed read at a block WITH code throws — never 0', async () => {
        const { service } = harness(chain(), {
            readAtOverride: (block) =>
                block === 300
                    ? Promise.reject(
                          new Error(
                              'missing revert data in call exception; Transaction reverted without a reason string',
                          ),
                      )
                    : Promise.resolve(BigNumber.from(0)),
        });
        await expect(service.getPoolTvlHistory(POOL_A)).rejects.toThrow(
            'missing revert data',
        );
    });

    it('a failed latest read throws too', async () => {
        const { service } = harness(chain(), {
            readAtOverride: (block) =>
                block === 'latest'
                    ? Promise.reject(new Error('upstream exhausted'))
                    : Promise.resolve(BigNumber.from(0)),
        });
        await expect(service.getPoolTvlHistory(POOL_XDC)).rejects.toThrow(
            'upstream exhausted',
        );
    });

    it('ONE getCode when the contract already existed at the oldest clearing', async () => {
        const { service, reads } = harness(chain());
        await service.getPoolTvlHistory(POOL_XDC);
        expect(reads.hasCodeAt).toEqual([500]);
    });
});

describe('getPoolTvlHistory — the quirks seen on live deployments', () => {
    it('a first clearing numbered far below the next (XDC AUDD) stays in place, dated by its own block', async () => {
        const { service } = harness(chain());
        const history = await service.getPoolTvlHistory(POOL_XDC);
        expect(history.map((p) => p.epochId)).toEqual([1, 4, 5, 6]);
        // Its clearing time, a week before the next — NOT the epoch clock,
        // which would put "epoch 1" years earlier.
        expect(history[0].timestamp).toBe(T0 + 4 * WEEK);
        expect(history[1].timestamp - history[0].timestamp).toBe(WEEK);
        expect(history[0].tvl).toBe(5 + 1_500_000);
        for (let i = 1; i < history.length; i++) {
            expect(history[i].timestamp).toBeGreaterThan(
                history[i - 1].timestamp,
            );
        }
    });

    it('a window by epoch leaves the mislabelled first clearing out', async () => {
        const { service } = harness(chain());
        const history = await service.getPoolTvlHistory(POOL_XDC, { count: 3 });
        expect(history.map((p) => p.epochId)).toEqual([4, 5, 6]);
    });

    it('a stalled pool ends at its last clearing, then the closing point', async () => {
        const { service } = harness(chain());
        const history = await service.getPoolTvlHistory(POOL_STALLED);
        expect(history.map((p) => [p.epochId, p.kind])).toEqual([
            [3, 'clearing'],
            [4, 'clearing'],
            [5, 'clearing'],
            [6, 'current'],
        ]);
        expect(new Set(history.map((p) => p.tvl))).toEqual(
            new Set([1_522_520.916665]),
        );
    });

    it('clearings in one block share timestamp and tvl, and the block is read once', async () => {
        const { service, graph, reads } = harness(chain());
        const history = await service.getPoolTvlHistory(POOL_STALLED);
        const [three, four, five] = history;
        expect(three.timestamp).toBe(four.timestamp);
        expect(four.timestamp).toBe(five.timestamp);
        const travel = (graph.mock.calls as [string][]).filter(([d]) =>
            d.startsWith('query PoolTvlAtBlocks'),
        );
        expect(travel).toHaveLength(1);
        expect(travel[0][0].match(/lendingPool\(/g)).toHaveLength(1);
        expect(reads.readAt.filter((b) => b === 350)).toHaveLength(1);
    });

    it('orders by block, not by epoch number', async () => {
        const state = chain();
        // An epoch number out of time order must not move a point in time.
        state.pools[1].clearings[0].epochId = 9;
        state.currentEpoch = 9;
        const { service } = harness(state);
        const history = await service.getPoolTvlHistory(POOL_XDC);
        expect(history.map((p) => p.epochId)).toEqual([9, 4, 5, 9]);
        for (let i = 1; i < history.length; i++) {
            expect(history[i].timestamp).toBeGreaterThan(
                history[i - 1].timestamp,
            );
        }
    });
});

describe('getPoolTvlHistory — window', () => {
    it('count = the newest epochs, the current one included', async () => {
        const { service } = harness(chain());
        const history = await service.getPoolTvlHistory(POOL_A, { count: 2 });
        expect(history.map((p) => [p.epochId, p.kind])).toEqual([
            [5, 'clearing'],
            [6, 'clearing'],
            [6, 'current'],
        ]);
    });

    it('fromEpoch + count = an exact slice, with no closing point when it stops short of now', async () => {
        const { service } = harness(chain());
        const history = await service.getPoolTvlHistory(POOL_A, {
            fromEpoch: 3,
            count: 2,
        });
        expect(history.map((p) => [p.epochId, p.kind])).toEqual([
            [3, 'clearing'],
            [4, 'clearing'],
        ]);
    });

    it('a windowed point equals the same point of the full history', async () => {
        const { service } = harness(chain());
        const full = await service.getPoolTvlHistory(POOL_A);
        const slice = await service.getPoolTvlHistory(POOL_A, { fromEpoch: 5 });
        expect(slice).toEqual(full.filter((p) => p.epochId >= 5));
    });

    it('a window past the current epoch is empty', async () => {
        const { service } = harness(chain());
        await expect(
            service.getPoolTvlHistory(POOL_A, { fromEpoch: 7 }),
        ).resolves.toEqual([]);
    });

    it.each([
        [{ count: 0 }],
        [{ count: -1 }],
        [{ count: 1.5 }],
        [{ fromEpoch: -1 }],
        [{ fromEpoch: Number.NaN }],
        [{ fromEpoch: '3' as unknown as number }],
    ])('refuses %j before any network read', async (options) => {
        const { service, graph, reads, currentEpochReads } = harness(chain());
        await expect(
            service.getPoolTvlHistory(POOL_A, options),
        ).rejects.toThrow(RangeError);
        expect(graph).not.toHaveBeenCalled();
        expect(currentEpochReads).not.toHaveBeenCalled();
        expect(reads.readAt).toEqual([]);
    });

    it('refuses a pool id that is not an address before any network read', async () => {
        const { service, graph } = harness(chain());
        await expect(service.getPoolTvlHistory('pool-a')).rejects.toThrow(
            TypeError,
        );
        expect(graph).not.toHaveBeenCalled();
    });
});

describe('resolvePoolTvlHistoryWindow', () => {
    it('resolves each option shape against the current epoch', () => {
        expect(resolvePoolTvlHistoryWindow({}, 124)).toEqual({
            fromEpoch: 0,
            toEpoch: 124,
        });
        expect(resolvePoolTvlHistoryWindow({ count: 52 }, 124)).toEqual({
            fromEpoch: 73,
            toEpoch: 124,
        });
        expect(resolvePoolTvlHistoryWindow({ count: 500 }, 124)).toEqual({
            fromEpoch: 0,
            toEpoch: 124,
        });
        expect(resolvePoolTvlHistoryWindow({ fromEpoch: 100 }, 124)).toEqual({
            fromEpoch: 100,
            toEpoch: 124,
        });
        expect(
            resolvePoolTvlHistoryWindow({ fromEpoch: 120, count: 10 }, 124),
        ).toEqual({ fromEpoch: 120, toEpoch: 124 });
        expect(resolvePoolTvlHistoryWindow({ fromEpoch: 125 }, 124)).toBeNull();
    });
});

describe('getPoolTvlHistory — deployments without the entities', () => {
    const missing = (message: string): Error =>
        Object.assign(new Error(message), {
            response: { errors: [{ message }], status: 200 },
        });
    const MESSAGE = 'Type `Query` has no field `lendingPoolClearings`';

    it('Lite: returns [] on a missing-schema error', async () => {
        const { service } = harness(chain(), {
            lite: true,
            graphOverride: () => {
                throw missing(MESSAGE);
            },
        });
        await expect(service.getPoolTvlHistory(POOL_XDC)).resolves.toEqual([]);
    });

    it('full deployment: THROWS on the same error', async () => {
        const { service } = harness(chain(), {
            graphOverride: () => {
                throw missing(MESSAGE);
            },
        });
        await expect(service.getPoolTvlHistory(POOL_A)).rejects.toThrow(
            MESSAGE,
        );
    });

    it('still throws on a network or pruned-block failure, even on Lite', async () => {
        const pruned = Object.assign(new Error('block not available'), {
            response: {
                errors: [
                    {
                        message:
                            'only has data starting at block number 98794584 and data for block number 1 is therefore not available',
                    },
                ],
            },
        });
        const { service } = harness(chain(), {
            lite: true,
            graphOverride: (document) => {
                if (document.startsWith('query PoolTvlAtBlocks')) throw pruned;
                return undefined;
            },
        });
        await expect(service.getPoolTvlHistory(POOL_XDC)).rejects.toThrow(
            'block not available',
        );
    });
});

describe('getPoolTvlHistory — bounded reads', () => {
    function longPool(epochs: number, deployedAt = 0): ChainState {
        const state = chain();
        state.currentEpoch = epochs + 4;
        state.externalDeployedAt = deployedAt;
        state.pools[0].clearings = Array.from({ length: epochs }, (_, i) => ({
            epochId: i + 5,
            block: 1_000 + i * 10,
            timestamp: T0 + i * WEEK,
        }));
        state.pools[0].balanceSteps = [[1_000, '100']];
        state.offChainSteps[POOL_A] = [[0, 0]];
        return state;
    }

    it('about 120 epochs: three subgraph requests, one read per block', async () => {
        const { service, graph, reads } = harness(longPool(120));
        const history = await service.getPoolTvlHistory(POOL_A);
        expect(clearingPoints(history)).toHaveLength(120);
        // 1 clearings page (+ snapshot) and ceil(120 / 100) time-travel pages.
        expect(graph).toHaveBeenCalledTimes(
            1 + Math.ceil(120 / TVL_HISTORY_BLOCKS_PER_REQUEST),
        );
        expect(graph).toHaveBeenCalledTimes(3);
        expect(reads.readAt.filter((b) => b !== 'latest')).toHaveLength(120);
        expect(reads.readAt.filter((b) => b === 'latest')).toHaveLength(1);
        expect(reads.hasCodeAt).toHaveLength(1);
    });

    it('never has more than the concurrency limit of RPC reads in flight', async () => {
        const { service, maxInFlight } = harness(longPool(120));
        await service.getPoolTvlHistory(POOL_A);
        expect(maxInFlight()).toBeLessThanOrEqual(TVL_HISTORY_RPC_CONCURRENCY);
        expect(maxInFlight()).toBeGreaterThan(1);
    });

    it('finds the deployment block in about log2(n) getCode reads', async () => {
        // Deployed between the 70th and 71st clearing.
        const { service, reads } = harness(longPool(120, 1_000 + 70 * 10 - 5));
        const history = await service.getPoolTvlHistory(POOL_A);
        expect(reads.hasCodeAt.length).toBeLessThanOrEqual(
            2 + Math.ceil(Math.log2(120)),
        );
        expect(reads.readAt.filter((b) => b !== 'latest')).toHaveLength(50);
        expect(clearingPoints(history)).toHaveLength(120);
    });

    it('paginates clearings past a thousand', async () => {
        const { service, graph } = harness(longPool(1_050));
        const history = await service.getPoolTvlHistory(POOL_A);
        expect(clearingPoints(history)).toHaveLength(1_050);
        const pages = (
            graph.mock.calls as [string, Record<string, unknown>][]
        ).filter(([d]) => d === poolTvlClearingsQuery);
        expect(pages).toHaveLength(2);
        expect(pages[0][1].withSnapshot).toBe(true);
        expect(pages[1][1].withSnapshot).toBe(false);
        expect(pages[1][1].fromEpoch).toBe(String(5 + 1_000));
    });
});

describe('getPoolTvlHistory — history provider', () => {
    it('throws NO_HISTORY_PROVIDER_MESSAGE before any network read when none is configured', async () => {
        const config = new SdkConfig({
            subgraphUrl: 'https://example.invalid/subgraph',
            contracts: CHAIN_CONFIGS.base.contracts,
            UNUSED_LENDING_POOL_IDS: [],
        });
        const service = new DataService(
            config,
            new providers.StaticJsonRpcProvider(
                'https://example.invalid/rpc',
                8453,
            ),
        );
        const request = jest.fn();
        (service as unknown as { _graph: unknown })._graph = { request };
        await expect(service.getPoolTvlHistory(POOL_A)).rejects.toThrow(
            NO_HISTORY_PROVIDER_MESSAGE,
        );
        expect(request).not.toHaveBeenCalled();
    });

    it('needs none on a deployment without an ExternalTVL contract: off-chain is 0', async () => {
        const state = chain();
        const config = new SdkConfig({
            subgraphUrl: 'https://example.invalid/subgraph',
            contracts: { ...CHAIN_CONFIGS.base.contracts, ExternalTVL: '' },
            UNUSED_LENDING_POOL_IDS: [],
        });
        const service = new DataService(
            config,
            new providers.StaticJsonRpcProvider(
                'https://example.invalid/rpc',
                8453,
            ),
        );
        const donor = harness(state);
        const internals = service as unknown as Record<string, unknown>;
        const donorInternals = donor.service as unknown as Record<
            string,
            unknown
        >;
        internals._graph = donorInternals._graph;
        internals._systemVariablesAbi = donorInternals._systemVariablesAbi;
        const history = await service.getPoolTvlHistory(POOL_A);
        expect(clearingPoints(history).map((p) => p.tvl)).toEqual([
            1_000_000, 1_000_000, 1_002_413.909756, 1_500_000, 1_250_000.5,
        ]);
        expect(history.at(-1)?.tvl).toBe(1_250_000.5);
    });

    it('built-in chains ship a past-state RPC, never rpc.xdc.org', () => {
        expect(CHAIN_CONFIGS.base.historyRpcUrl).toBe(
            'https://mainnet.base.org',
        );
        expect(CHAIN_CONFIGS.xdc.historyRpcUrl).toBe(
            'https://rpc.primenumbers.xyz/',
        );
        expect(CHAIN_CONFIGS['xdc-usdc'].historyRpcUrl).toBe(
            'https://rpc.primenumbers.xyz/',
        );
        for (const entry of Object.values(CHAIN_CONFIGS)) {
            expect(entry.historyRpcUrl ?? '').not.toMatch(
                /(^|\/\/|\.)e?rpc\.xdc\.org/,
            );
            // The default read RPC refuses past state on Base; never reuse it.
            if (entry.historyRpcUrl) {
                expect(entry.historyRpcUrl).not.toBe(entry.rpcUrls[0]);
            }
        }
    });

    it('Kasu.create builds the history provider from the chain config', () => {
        const kasu = Kasu.create({ chain: 'base' });
        const history = (
            kasu.services.DataService as unknown as {
                _historyProvider: providers.StaticJsonRpcProvider;
            }
        )._historyProvider;
        expect(history.connection.url).toBe('https://mainnet.base.org');
    });

    it('an explicit historyProvider wins and survives connect()', () => {
        const mine = new providers.StaticJsonRpcProvider(
            'https://example.invalid/archive',
            8453,
        );
        const kasu = Kasu.create({ chain: 'base', historyProvider: mine });
        const of = (k: Kasu): unknown =>
            (k.services.DataService as unknown as { _historyProvider: unknown })
                ._historyProvider;
        expect(of(kasu)).toBe(mine);
        const signed = kasu.connect(
            Wallet.createRandom().connect(kasu.provider),
        );
        expect(of(signed)).toBe(mine);
    });

    it('configOverrides.historyRpcUrl replaces the chain default', () => {
        const kasu = Kasu.create({
            chain: 'xdc',
            configOverrides: {
                historyRpcUrl: 'https://example.invalid/xdc-archive',
            },
        });
        const history = (
            kasu.services.DataService as unknown as {
                _historyProvider: providers.StaticJsonRpcProvider;
            }
        )._historyProvider;
        expect(history.connection.url).toBe(
            'https://example.invalid/xdc-archive',
        );
    });
});

describe('tvl-history helpers', () => {
    it('poolBalancesAtBlocksQuery writes one alias per block and refuses non-integers', () => {
        expect(poolBalancesAtBlocksQuery([100, 200])).toBe(
            'query PoolTvlAtBlocks($poolId: ID!) { b100: lendingPool(id: $poolId, block: { number: 100 }) { balance } b200: lendingPool(id: $poolId, block: { number: 200 }) { balance } }',
        );
        expect(() => poolBalancesAtBlocksQuery([1.5])).toThrow('refusing');
        expect(() => poolBalancesAtBlocksQuery([0])).toThrow('refusing');
        expect(() => poolBalancesAtBlocksQuery([Number.NaN])).toThrow(
            'refusing',
        );
    });

    it('fetchPoolBalancesAtBlocks throws when the subgraph has no pool state at a block', async () => {
        const request = jest.fn(() => Promise.resolve({ b100: null }));
        await expect(
            fetchPoolBalancesAtBlocks(
                request as unknown as Parameters<
                    typeof fetchPoolBalancesAtBlocks
                >[0],
                POOL_A,
                [100],
            ),
        ).rejects.toThrow('no state for the pool at block 100');
    });

    it('firstBlockWithCode finds the boundary', async () => {
        const blocks = [10, 20, 30, 40, 50, 60, 70];
        for (const deployed of [0, 10, 25, 40, 70, 71, 1_000]) {
            const index = await firstBlockWithCode(blocks, (b) =>
                Promise.resolve(b >= deployed),
            );
            expect(index).toBe(
                blocks.findIndex((b) => b >= deployed) === -1
                    ? blocks.length
                    : blocks.findIndex((b) => b >= deployed),
            );
        }
        await expect(
            firstBlockWithCode([], () => Promise.resolve(true)),
        ).resolves.toBe(0);
    });

    it('mapWithConcurrency keeps order, bounds the flight and rejects on a failure', async () => {
        let inFlight = 0;
        let peak = 0;
        const out = await mapWithConcurrency(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            3,
            async (n) => {
                inFlight += 1;
                peak = Math.max(peak, inFlight);
                await new Promise((resolve) => setTimeout(resolve, 2));
                inFlight -= 1;
                return n * 2;
            },
        );
        expect(out).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
        expect(peak).toBe(3);
        await expect(
            mapWithConcurrency([1, 2, 3], 2, (n) =>
                n === 2
                    ? Promise.reject(new Error('boom'))
                    : Promise.resolve(n),
            ),
        ).rejects.toThrow('boom');
    });

    it('retryingReader retries with back-off, then rethrows — never a value', async () => {
        const sleeps: number[] = [];
        let calls = 0;
        const flaky = retryingReader(
            {
                readAt: () => {
                    calls += 1;
                    return calls < 3
                        ? Promise.reject(new Error('429'))
                        : Promise.resolve(BigNumber.from(7));
                },
                hasCodeAt: () => Promise.reject(new Error('down')),
            },
            {
                sleep: (ms) => {
                    sleeps.push(ms);
                    return Promise.resolve();
                },
            },
        );
        await expect(flaky.readAt(1)).resolves.toEqual(BigNumber.from(7));
        expect(sleeps).toEqual([500, 1_000]);
        await expect(flaky.hasCodeAt(1)).rejects.toThrow('down');
    });
});
