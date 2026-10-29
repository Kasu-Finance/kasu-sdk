import { BigNumber, providers, Wallet } from 'ethers';
import { Interface } from 'ethers/lib/utils';

import { KasuPoolExternalTVLAbi__factory } from '../../contracts';
import {
    combineTvlHistories,
    poolTvl,
    PoolTvlHistoryEntry,
} from '../../domain/pool-tvl';
import { CHAIN_CONFIGS } from '../../facade/chain-configs';
import { Kasu } from '../../facade/kasu';
import { StrategiesFacade } from '../../facade/strategies';
import { SdkConfig } from '../../sdk-config';

import { DataService, NO_HISTORY_PROVIDER_MESSAGE } from './data-service';
import {
    Cancellation,
    Clearing,
    createOffChainTvlReader,
    fetchPoolBalancesAtBlocks,
    firstBlockWithCode,
    HistoryRpc,
    mapWithConcurrency,
    PastStateUnavailableError,
    pickOpeningClearing,
    poolBalancesAtBlocksQuery,
    PoolTvlHistoryAbortedError,
    PoolTvlHistoryOptions,
    PoolTvlHistoryResult,
    PoolTvlHistoryTimeoutError,
    poolTvlClearingsQuery,
    resolvePoolTvlHistoryWindow,
    runCancellable,
    TVL_HISTORY_BLOCKS_PER_REQUEST,
    TVL_HISTORY_RPC_ATTEMPTS,
    TVL_HISTORY_RPC_CONCURRENCY,
    TVL_HISTORY_RPC_TIMEOUT_MS,
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

/** A cancellation that never fires, for the helpers called directly. */
const NEVER_CANCELLED: Cancellation = {
    signal: new AbortController().signal,
    throwIfCancelled: () => undefined,
};

const EXTERNAL_TVL = CHAIN_CONFIGS.base.contracts.ExternalTVL.toLowerCase();
const TVL_ABI = new Interface(KasuPoolExternalTVLAbi__factory.abi);

interface FakeRpcOptions {
    /** A pruned node: every getCode below this block answers '0x'. */
    prunedBelow?: number;
    /** getCode for the ExternalTVL contract rejects. */
    failGetCode?: boolean;
    /** Each call waits this long (ms). */
    delayMs?: number;
}

/**
 * A history RPC answering per block from the synthetic chain, as a node
 * does: `eth_call` to an address without code returns '0x'.
 */
class FakeHistoryRpc implements HistoryRpc {
    calls: { to: string; pool: string; blockTag: number | 'latest' }[] = [];
    codes: { address: string; blockTag: number }[] = [];
    inFlight = 0;
    peak = 0;
    callOverride?: (block: number | 'latest') => Promise<BigNumber>;

    constructor(
        private readonly state: ChainState,
        private readonly options: FakeRpcOptions = {},
    ) {}

    async call(
        transaction: { to: string; data: string },
        blockTag: number | 'latest',
    ): Promise<string> {
        const [pool] = TVL_ABI.decodeFunctionData(
            'externalTVLOfPool',
            transaction.data,
        ) as unknown as [string];
        this.calls.push({
            to: transaction.to.toLowerCase(),
            pool: pool.toLowerCase(),
            blockTag,
        });
        this.inFlight += 1;
        this.peak = Math.max(this.peak, this.inFlight);
        try {
            await new Promise((resolve) =>
                setTimeout(resolve, this.options.delayMs ?? 1),
            );
            if (this.callOverride) {
                return TVL_ABI.encodeFunctionResult('externalTVLOfPool', [
                    await this.callOverride(blockTag),
                ]);
            }
            if (
                transaction.to.toLowerCase() !== EXTERNAL_TVL ||
                (blockTag !== 'latest' &&
                    blockTag < this.state.externalDeployedAt)
            ) {
                return '0x';
            }
            const id = pool.toLowerCase();
            const value =
                blockTag === 'latest'
                    ? this.state.offChainNow[id]
                    : (stepAt(this.state.offChainSteps[id] ?? [], blockTag) ??
                      0);
            return TVL_ABI.encodeFunctionResult('externalTVLOfPool', [
                BigNumber.from(value),
            ]);
        } finally {
            this.inFlight -= 1;
        }
    }

    getCode(address: string, blockTag: number): Promise<string> {
        const lower = address.toLowerCase();
        this.codes.push({ address: lower, blockTag });
        if (
            this.options.prunedBelow !== undefined &&
            blockTag < this.options.prunedBelow
        ) {
            return Promise.resolve('0x');
        }
        if (lower === EXTERNAL_TVL) {
            if (this.options.failGetCode) {
                return Promise.reject(new Error('getCode: upstream exhausted'));
            }
            return Promise.resolve(
                blockTag >= this.state.externalDeployedAt ? '0x6080' : '0x',
            );
        }
        // A pool contract: deployed long before any clearing.
        return Promise.resolve('0x6080');
    }
}

interface Harness {
    service: DataService;
    graph: jest.Mock;
    reads: { readAt: (number | 'latest')[]; hasCodeAt: number[] };
    maxInFlight: () => number;
    currentEpochReads: jest.Mock;
    rpc: FakeHistoryRpc;
    sleeps: number[];
    signals: (AbortSignal | undefined)[];
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
        rpcOptions = {},
    }: {
        lite?: boolean;
        graphOverride?: GraphOverride;
        readAtOverride?: (block: number | 'latest') => Promise<BigNumber>;
        rpcOptions?: FakeRpcOptions;
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
                const gte = Number(variables.epochGte);
                const lt = Number(variables.epochLt);
                const first = Number(variables.first);
                const desc = variables.direction === 'desc';
                const clearings = (pool?.clearings ?? [])
                    .filter((c) => c.epochId >= gte && c.epochId < lt)
                    .sort((a, b) =>
                        desc ? b.epochId - a.epochId : a.epochId - b.epochId,
                    )
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

    const rpc = new FakeHistoryRpc(state, rpcOptions);
    if (readAtOverride) rpc.callOverride = readAtOverride;
    const sleeps: number[] = [];

    const internals = service as unknown as {
        _graph: unknown;
        _systemVariablesAbi: unknown;
        _externalTvlAbi: unknown;
        _explicitHistoryProvider: unknown;
        _createOffChainTvlReader: (
            args: Parameters<typeof createOffChainTvlReader>[0],
        ) => ReturnType<typeof createOffChainTvlReader>;
    };
    internals._graph = {
        // The history passes one options object (with a signal); the
        // pool overview passes (document, variables).
        request: (
            o:
                | string
                | {
                      document: string;
                      variables: Record<string, unknown>;
                      signal?: AbortSignal;
                  },
            variables?: Record<string, unknown>,
        ): Promise<unknown> => {
            if (typeof o === 'string') {
                return graph(o, variables ?? {}) as Promise<unknown>;
            }
            signals.push(o.signal);
            return graph(o.document, o.variables) as Promise<unknown>;
        },
    };
    const signals: (AbortSignal | undefined)[] = [];
    const currentEpochReads = jest.fn(() =>
        Promise.resolve(BigNumber.from(state.currentEpoch)),
    );
    internals._systemVariablesAbi = { currentEpochNumber: currentEpochReads };
    internals._externalTvlAbi = {
        externalTVLOfPool: (poolId: string) =>
            Promise.resolve(BigNumber.from(state.offChainNow[poolId])),
    };
    // The REAL reader over a fake history RPC; only the back-off sleep is
    // replaced, so a retry costs no wall-clock time.
    internals._explicitHistoryProvider = rpc;
    internals._createOffChainTvlReader = (
        args,
    ): ReturnType<typeof createOffChainTvlReader> =>
        createOffChainTvlReader({
            ...args,
            sleep: (ms) => {
                sleeps.push(ms);
                return Promise.resolve();
            },
        });

    const reads = {
        get readAt(): (number | 'latest')[] {
            return rpc.calls.map((c) => c.blockTag);
        },
        get hasCodeAt(): number[] {
            return rpc.codes
                .filter((c) => c.address === EXTERNAL_TVL)
                .map((c) => c.blockTag);
        },
    };

    return {
        service,
        graph,
        reads,
        rpc,
        sleeps,
        signals,
        maxInFlight: () => rpc.peak,
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
        expect(pages[1][1].epochGte).toBe(String(5 + 1_000));
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

    it('built-in chains ship past-state RPCs, never rpc.xdc.org nor the default read RPC', () => {
        expect(CHAIN_CONFIGS.base.historyRpcUrls).toEqual([
            'https://mainnet.base.org',
            'https://base.drpc.org',
            'https://1rpc.io/base',
        ]);
        expect(CHAIN_CONFIGS.xdc.historyRpcUrls).toEqual([
            'https://rpc.primenumbers.xyz/',
            'https://rpc.ankr.com/xdc',
        ]);
        expect(CHAIN_CONFIGS['xdc-usdc'].historyRpcUrls).toEqual(
            CHAIN_CONFIGS.xdc.historyRpcUrls,
        );
        for (const entry of Object.values(CHAIN_CONFIGS)) {
            for (const url of entry.historyRpcUrls ?? []) {
                expect(url).not.toMatch(/(^|\/\/|\.)e?rpc\.xdc\.org/);
                // Base's default read RPC refuses past state.
                if (entry === CHAIN_CONFIGS.base) {
                    expect(url).not.toBe(entry.rpcUrls[0]);
                }
            }
        }
    });

    const built = (k: Kasu): providers.StaticJsonRpcProvider[] =>
        (
            k.services.DataService as unknown as {
                _historyRpcs: () => providers.StaticJsonRpcProvider[];
            }
        )._historyRpcs();

    it('builds ONE provider per history URL, in order, pinned to the chain id, with a per-call timeout', () => {
        const kasu = Kasu.create({ chain: 'base' });
        const list = built(kasu);
        expect(list.map((p) => p.connection.url)).toEqual(
            CHAIN_CONFIGS.base.historyRpcUrls,
        );
        for (const p of list) {
            expect(p.connection.timeout).toBe(TVL_HISTORY_RPC_TIMEOUT_MS);
            expect(
                (p as unknown as { _network?: { chainId: number } })._network
                    ?.chainId,
            ).toBe(8453);
        }
        // Built once per instance.
        expect(built(kasu)[0]).toBe(list[0]);
    });

    it('an explicit historyProvider wins and survives connect()', () => {
        const mine = new providers.StaticJsonRpcProvider(
            'https://example.invalid/archive',
            8453,
        );
        const kasu = Kasu.create({ chain: 'base', historyProvider: mine });
        expect(built(kasu)).toEqual([mine]);
        const signed = kasu.connect(
            Wallet.createRandom().connect(kasu.provider),
        );
        expect(built(signed)).toEqual([mine]);
    });

    it('configOverrides.historyRpcUrls replaces the chain default', () => {
        const kasu = Kasu.create({
            chain: 'xdc',
            configOverrides: {
                historyRpcUrls: ['https://example.invalid/xdc-archive'],
            },
        });
        const list = built(kasu);
        expect(list.map((p) => p.connection.url)).toEqual([
            'https://example.invalid/xdc-archive',
        ]);
        expect(
            (list[0] as unknown as { _network?: { chainId: number } })._network
                ?.chainId,
        ).toBe(50);
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
                NEVER_CANCELLED,
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
});

describe('the real history reader (createOffChainTvlReader)', () => {
    it('every externalTVLOfPool call and every getCode carries the block it is for', async () => {
        const { service, rpc } = harness(chain());
        await service.getPoolTvlHistory(POOL_A);
        // Deployed at 250: the clearing blocks with code are 300 and 400.
        expect(rpc.calls.map((c) => c.blockTag).sort()).toEqual(
            [300, 400, 'latest'].sort(),
        );
        for (const call of rpc.calls) {
            expect(call.to).toBe(EXTERNAL_TVL);
            expect(call.pool).toBe(POOL_A);
        }
        const codeBlocks = rpc.codes.map((c) => c.blockTag);
        expect(codeBlocks.length).toBeGreaterThan(0);
        for (const block of codeBlocks) {
            expect([100, 200, 300, 400]).toContain(block);
        }
        // The pruned-node check asks for the POOL's code at the no-code blocks.
        expect(
            rpc.codes
                .filter((c) => c.address === POOL_A)
                .map((c) => c.blockTag),
        ).toEqual([100, 200]);
    });

    it('a getCode error throws — it is never read as "no contract"', async () => {
        const { service, rpc } = harness(chain(), {
            rpcOptions: { failGetCode: true },
        });
        await expect(service.getPoolTvlHistory(POOL_A)).rejects.toThrow(
            'getCode: upstream exhausted',
        );
        expect(rpc.calls).toEqual([]);
    });

    it('retries with back-off, then throws the last error', async () => {
        const { service, rpc, sleeps } = harness(chain(), {
            readAtOverride: () =>
                Promise.reject(new Error('429 Too Many Requests')),
        });
        await expect(service.getPoolTvlHistory(POOL_XDC)).rejects.toThrow(
            '429 Too Many Requests',
        );
        const perBlock = rpc.calls.filter((c) => c.blockTag === 500);
        expect(perBlock).toHaveLength(TVL_HISTORY_RPC_ATTEMPTS);
        // Back-off doubles per attempt (reads run concurrently, so the
        // sleeps of different blocks interleave).
        expect(new Set(sleeps)).toEqual(new Set([500, 1_000]));
    });

    it('a retry that succeeds yields the value', async () => {
        let failures = 2;
        const { service } = harness(chain(), {
            readAtOverride: (block) =>
                block === 'latest' && failures-- > 0
                    ? Promise.reject(new Error('transient'))
                    : Promise.resolve(BigNumber.from(1_000_000)),
        });
        const history = await service.getPoolTvlHistory(POOL_STALLED);
        expect(history.at(-1)?.tvl).toBe(1_522_520.916665 + 1);
    });

    it('falls back through the history RPCs in order', async () => {
        const state = chain();
        const downCall = jest.fn(() =>
            Promise.reject(new Error('first is down')),
        );
        const down: HistoryRpc = {
            call: downCall,
            getCode: jest.fn(() => Promise.reject(new Error('first is down'))),
        };
        const up = new FakeHistoryRpc(state);
        const reader = createOffChainTvlReader({
            externalTvl: EXTERNAL_TVL,
            pool: POOL_XDC,
            rpcs: [down, up],
            cancellation: NEVER_CANCELLED,
            sleep: () => Promise.resolve(),
        });
        await expect(reader.readAt(600)).resolves.toEqual(
            BigNumber.from(1_500_000_000_000),
        );
        await expect(reader.hasCodeAt(600)).resolves.toBe(true);
        expect(downCall).toHaveBeenCalledTimes(1);
        expect(up.calls.map((c) => c.blockTag)).toEqual([600]);
    });

    it('a call answered with "0x" (no contract) is an error, not 0', async () => {
        const reader = createOffChainTvlReader({
            externalTvl: EXTERNAL_TVL,
            pool: POOL_XDC,
            rpcs: [new FakeHistoryRpc(chain())],
            cancellation: NEVER_CANCELLED,
            sleep: () => Promise.resolve(),
        });
        await expect(reader.readAt(100)).rejects.toThrow();
    });
});

describe('getPoolTvlHistory — a pruned history provider', () => {
    it('throws PastStateUnavailableError instead of zeroing the off-chain TVL', async () => {
        // A node that answers every old getCode with "0x": the ExternalTVL
        // search would conclude "not deployed yet" for the old blocks.
        const { service } = harness(chain(), {
            rpcOptions: { prunedBelow: 350 },
        });
        await expect(service.getPoolTvlHistory(POOL_A)).rejects.toBeInstanceOf(
            PastStateUnavailableError,
        );
    });

    it('believes "not deployed" only when the pool has code there', async () => {
        const { service, rpc } = harness(chain());
        await expect(service.getPoolTvlHistory(POOL_A)).resolves.toHaveLength(
            6,
        );
        expect(rpc.codes.some((c) => c.address === POOL_A)).toBe(true);
    });
});

describe('getPoolTvlHistory — time limit and abort', () => {
    it('rejects with PoolTvlHistoryTimeoutError and starts nothing after', async () => {
        const { service, rpc } = harness(chain(), {
            rpcOptions: { delayMs: 40 },
        });
        const started = Date.now();
        await expect(
            service.getPoolTvlHistory(POOL_A, { timeoutMs: 20 }),
        ).rejects.toBeInstanceOf(PoolTvlHistoryTimeoutError);
        expect(Date.now() - started).toBeLessThan(200);
        const sent = rpc.calls.length + rpc.codes.length;
        await new Promise((resolve) => setTimeout(resolve, 150));
        // In-flight calls may finish; none may START after the deadline.
        expect(rpc.calls.length + rpc.codes.length).toBe(sent);
    });

    it('aborts the in-flight subgraph requests through their signal', async () => {
        const { service, signals } = harness(chain(), {
            rpcOptions: { delayMs: 40 },
        });
        await expect(
            service.getPoolTvlHistory(POOL_A, { timeoutMs: 20 }),
        ).rejects.toBeInstanceOf(PoolTvlHistoryTimeoutError);
        expect(signals.length).toBeGreaterThan(0);
        for (const signal of signals) expect(signal?.aborted).toBe(true);
    });

    it('rejects with PoolTvlHistoryAbortedError when the signal fires', async () => {
        const { service } = harness(chain(), { rpcOptions: { delayMs: 40 } });
        const controller = new AbortController();
        const pending = service.getPoolTvlHistory(POOL_A, {
            signal: controller.signal,
        });
        setTimeout(() => {
            controller.abort();
        }, 10);
        await expect(pending).rejects.toBeInstanceOf(
            PoolTvlHistoryAbortedError,
        );
    });

    it('an already-aborted signal rejects before any network read', async () => {
        const { service, graph, rpc, currentEpochReads } = harness(chain());
        const controller = new AbortController();
        controller.abort();
        await expect(
            service.getPoolTvlHistory(POOL_A, { signal: controller.signal }),
        ).rejects.toBeInstanceOf(PoolTvlHistoryAbortedError);
        expect(graph).not.toHaveBeenCalled();
        expect(currentEpochReads).not.toHaveBeenCalled();
        expect(rpc.calls).toEqual([]);
    });

    it.each([
        [{ timeoutMs: 0 }],
        [{ timeoutMs: -5 }],
        [{ timeoutMs: Number.NaN }],
    ])('refuses %j before any network read', async (options) => {
        const { service, graph } = harness(chain());
        await expect(
            service.getPoolTvlHistory(POOL_A, options),
        ).rejects.toThrow(RangeError);
        expect(graph).not.toHaveBeenCalled();
    });

    it('runCancellable clears its timer once the work settles', async () => {
        jest.useFakeTimers();
        try {
            await expect(
                runCancellable(1_000, undefined, () => Promise.resolve(7)),
            ).resolves.toBe(7);
            expect(jest.getTimerCount()).toBe(0);
        } finally {
            jest.useRealTimers();
        }
    });
});

describe('getPoolTvlHistory — reuse of past-block reads', () => {
    it('a second call reads only what is not final yet', async () => {
        const { service, graph, rpc } = harness(chain());
        const first = await service.getPoolTvlHistory(POOL_A);
        const graphCalls = graph.mock.calls.length;
        const rpcCalls = rpc.calls.length;
        const codeCalls = rpc.codes.length;

        const second = await service.getPoolTvlHistory(POOL_A);
        expect(second).toEqual(first);
        const travel = (graph.mock.calls as [string][])
            .slice(graphCalls)
            .filter(([d]) => d.startsWith('query PoolTvlAtBlocks'));
        expect(travel).toEqual([]);
        // Only the moving "latest" read goes out again.
        expect(rpc.calls.slice(rpcCalls).map((c) => c.blockTag)).toEqual([
            'latest',
        ]);
        expect(rpc.codes.length).toBe(codeCalls);
    });

    it('never caches blocks near the head', async () => {
        const state = chain();
        state.latestBlock = 420; // block 400 is only 20 below the head
        const { service, rpc } = harness(state);
        await service.getPoolTvlHistory(POOL_A);
        const before = rpc.calls.length;
        await service.getPoolTvlHistory(POOL_A);
        expect(
            rpc.calls
                .slice(before)
                .map((c) => c.blockTag)
                .sort(),
        ).toEqual([400, 'latest'].sort());
    });

    it('keys the cache by pool: another pool reads its own blocks', async () => {
        const { service, rpc } = harness(chain());
        await service.getPoolTvlHistory(POOL_XDC);
        const before = rpc.calls.length;
        await service.getPoolTvlHistory(POOL_A);
        expect(rpc.calls.slice(before).every((c) => c.pool === POOL_A)).toBe(
            true,
        );
        expect(rpc.calls.length).toBeGreaterThan(before + 1);
    });
});

describe('getPoolTvlHistory — a count window reads only the newest clearings', () => {
    it('asks for the newest N, descending, in one page', async () => {
        const { service, graph } = harness(chain());
        const history = await service.getPoolTvlHistory(POOL_A, { count: 2 });
        expect(history.map((p) => p.epochId)).toEqual([5, 6, 6]);
        const pages = (
            graph.mock.calls as [string, Record<string, unknown>][]
        ).filter(([d]) => d === poolTvlClearingsQuery);
        expect(pages).toHaveLength(1);
        expect(pages[0][1]).toMatchObject({ direction: 'desc', first: 2 });
    });

    it('the subgraph without a latest block time is an error, not a guess', async () => {
        const state = chain();
        state.latestTime = null;
        const { service } = harness(state);
        await expect(service.getPoolTvlHistory(POOL_A)).rejects.toThrow(
            'no latest block time',
        );
    });
});

describe('getPoolTvlHistoryWindow — opening', () => {
    const CURRENT = 120;
    const COUNT = 52;
    const blockOf = (epochId: number): number => 1_000 + epochId * 10;

    /**
     * POOL_A clearing exactly these epochs, one block and week apart, holding
     * `epochId × 10` from each clearing on (so a point names its block).
     */
    function poolClearing(
        epochs: number[],
        placed: Partial<
            Record<number, { block: number; timestamp: number }>
        > = {},
    ): ChainState {
        const state = chain();
        state.currentEpoch = CURRENT;
        state.latestBlock = blockOf(CURRENT + 1);
        state.latestTime = T0 + CURRENT * WEEK + 2 * 24 * 3_600;
        state.externalDeployedAt = 0;
        state.pools[0].clearings = epochs.map((epochId) => ({
            epochId,
            block: placed[epochId]?.block ?? blockOf(epochId),
            timestamp: placed[epochId]?.timestamp ?? T0 + epochId * WEEK,
        }));
        state.pools[0].balanceSteps = state.pools[0].clearings
            .map((c): [number, string] => [c.block, String(c.epochId * 10)])
            .sort((x, y) => x[0] - y[0]);
        state.pools[0].balanceNow = '999';
        state.offChainSteps[POOL_A] = [[0, 0]];
        return state;
    }
    const range = (from: number, to: number): number[] =>
        Array.from({ length: to - from + 1 }, (_, i) => from + i);
    const read = (
        state: ChainState,
        options: PoolTvlHistoryOptions = { count: COUNT },
    ): Promise<PoolTvlHistoryResult> =>
        harness(state).service.getPoolTvlHistoryWindow(POOL_A, options);
    const pointAt = (epochId: number): PoolTvlHistoryEntry => ({
        epochId,
        timestamp: T0 + epochId * WEEK,
        tvl: epochId * 10,
        kind: 'clearing',
    });
    const clearingRequests = (graph: jest.Mock): Record<string, unknown>[] =>
        (graph.mock.calls as [string, Record<string, unknown>][])
            .filter(([d]) => d === poolTvlClearingsQuery)
            .map(([, variables]) => variables);

    it('long history, current epoch not yet cleared: the clearing just before the window', async () => {
        const { entries, opening } = await read(
            poolClearing(range(1, CURRENT - 1)),
        );
        expect(entries[0].epochId).toBe(CURRENT - COUNT + 1);
        expect(opening).toEqual(pointAt(CURRENT - COUNT));
    });

    it('long history, just after the current epoch cleared: the same opening', async () => {
        const { entries, opening } = await read(
            poolClearing(range(1, CURRENT)),
        );
        expect(clearingPoints(entries)).toHaveLength(COUNT);
        expect(opening).toEqual(pointAt(CURRENT - COUNT));
    });

    it('a young pool that started inside the window has none', async () => {
        const { entries, opening } = await read(
            poolClearing(range(100, CURRENT - 1)),
        );
        expect(entries[0].epochId).toBe(100);
        expect(opening).toBeNull();
    });

    it('a skipped clearing inside the window does not move it', async () => {
        const epochs = range(1, CURRENT - 1).filter((e) => e !== 90);
        const { opening } = await read(poolClearing(epochs));
        expect(opening).toEqual(pointAt(CURRENT - COUNT));
    });

    it('a mislabelled first clearing becomes the opening; the other chain keeps its whole window', async () => {
        // XDC AUDD's shape: its first clearing is numbered 1 but finished a
        // few days before epoch 88, holding a few units, then 88 onwards.
        const mislabelled = {
            block: blockOf(88) - 5,
            timestamp: T0 + 88 * WEEK - 3 * 24 * 3_600,
        };
        const xdc = await read(
            poolClearing([1, ...range(88, CURRENT - 1)], { 1: mislabelled }),
        );
        expect(xdc.entries[0].epochId).toBe(88);
        expect(xdc.opening).toEqual({
            epochId: 1,
            timestamp: mislabelled.timestamp,
            tvl: 10,
            kind: 'clearing',
        });

        const base = await read(poolClearing(range(1, CURRENT - 1)));
        const combined = combineTvlHistories([
            { ...base, usdRate: 1 },
            { ...xdc, usdRate: 0.5 },
        ]);
        // Base epochs 69–87 stay on the chart; nothing is clipped.
        expect(combined[0].timestamp).toBe(base.entries[0].timestamp);
        const kept = new Set(combined.map((p) => p.timestamp));
        for (const epochId of range(CURRENT - COUNT + 1, 87)) {
            expect(kept.has(T0 + epochId * WEEK)).toBe(true);
        }
        // Base's epoch 87 is earlier than XDC's opening: XDC counts 0 there,
        // not a value carried back before it existed.
        const atEpoch87 = combined.find((p) => p.timestamp === T0 + 87 * WEEK);
        expect(atEpoch87?.tvlUsd).toBe(870);
    });

    it('fromEpoch: the newest clearing numbered below it, from one extra request', async () => {
        const h = harness(poolClearing(range(1, CURRENT - 1)));
        const { entries, opening } = await h.service.getPoolTvlHistoryWindow(
            POOL_A,
            { fromEpoch: 100 },
        );
        expect(entries[0].epochId).toBe(100);
        expect(opening).toEqual(pointAt(99));
        const requests = clearingRequests(h.graph);
        expect(requests).toHaveLength(2);
        expect(requests).toContainEqual(
            expect.objectContaining({
                epochLt: '100',
                direction: 'desc',
                first: 1,
                withSnapshot: false,
            }),
        );
    });

    it('fromEpoch: none when nothing cleared below it', async () => {
        const { opening } = await read(poolClearing(range(100, CURRENT - 1)), {
            fromEpoch: 100,
        });
        expect(opening).toBeNull();
    });

    it('the whole history (or fromEpoch 0) has none and makes no extra request', async () => {
        for (const options of [{}, { fromEpoch: 0 }]) {
            const h = harness(poolClearing(range(1, CURRENT - 1)));
            const { opening } = await h.service.getPoolTvlHistoryWindow(
                POOL_A,
                options,
            );
            expect(opening).toBeNull();
            expect(clearingRequests(h.graph)).toHaveLength(1);
        }
    });

    it('costs one more clearing row and one more block, in the same requests', async () => {
        const state = poolClearing(range(1, CURRENT - 1));
        const plain = harness(state);
        const windowed = harness(state);
        const history = await plain.service.getPoolTvlHistory(POOL_A, {
            count: COUNT,
        });
        const result = await windowed.service.getPoolTvlHistoryWindow(POOL_A, {
            count: COUNT,
        });
        expect(result.entries).toEqual(history);
        expect(clearingRequests(plain.graph)).toEqual([
            expect.objectContaining({ first: COUNT }),
        ]);
        expect(clearingRequests(windowed.graph)).toEqual([
            expect.objectContaining({ first: COUNT + 1 }),
        ]);
        // Same number of subgraph requests: the opening's block rides in the
        // same batched time-travel read.
        expect(windowed.graph.mock.calls.length).toBe(
            plain.graph.mock.calls.length,
        );
        const pastReads = (h: Harness): (number | 'latest')[] =>
            h.reads.readAt.filter((b) => b !== 'latest');
        expect(pastReads(windowed).sort()).toEqual(
            [...pastReads(plain), blockOf(CURRENT - COUNT)].sort(),
        );
    });

    it('reads the opening through the past-block cache', async () => {
        const { service, rpc } = harness(poolClearing(range(1, CURRENT - 1)));
        await service.getPoolTvlHistoryWindow(POOL_A, { count: COUNT });
        const before = rpc.calls.length;
        const again = await service.getPoolTvlHistoryWindow(POOL_A, {
            count: COUNT,
        });
        expect(again.opening).toEqual(pointAt(CURRENT - COUNT));
        expect(rpc.calls.slice(before).map((c) => c.blockTag)).not.toContain(
            blockOf(CURRENT - COUNT),
        );
    });

    it('an unknown pool is empty with no opening', async () => {
        await expect(
            harness(chain()).service.getPoolTvlHistoryWindow(UNKNOWN_POOL, {
                count: COUNT,
            }),
        ).resolves.toEqual({ entries: [], opening: null });
    });

    it('validates like getPoolTvlHistory, before any network read', async () => {
        const { service, graph } = harness(chain());
        await expect(
            service.getPoolTvlHistoryWindow(POOL_A, { count: 0 }),
        ).rejects.toThrow(RangeError);
        await expect(service.getPoolTvlHistoryWindow('pool-a')).rejects.toThrow(
            TypeError,
        );
        expect(graph).not.toHaveBeenCalled();
    });

    it('kasu.strategies passes it through, ready to be a leg', async () => {
        const old = new StrategiesFacade(
            harness(poolClearing(range(1, CURRENT - 1))).service,
            null as never,
        );
        const young = new StrategiesFacade(
            harness(poolClearing(range(100, CURRENT - 1))).service,
            null as never,
        );
        const legs = [
            {
                ...(await old.getPoolTvlHistoryWindow(POOL_A, {
                    count: COUNT,
                })),
                usdRate: 1,
            },
            {
                ...(await young.getPoolTvlHistoryWindow(POOL_A, {
                    count: COUNT,
                })),
                usdRate: 0.5,
            },
        ];
        expect(legs.map((leg) => leg.opening?.epochId ?? null)).toEqual([
            CURRENT - COUNT,
            null,
        ]);
        const combined = combineTvlHistories(legs);
        expect(combined[0]).toEqual({
            timestamp: legs[0].entries[0].timestamp,
            tvlUsd: legs[0].entries[0].tvl,
            kind: 'clearing',
        });
        expect(combined.at(-1)?.kind).toBe('current');
    });
});

describe('pickOpeningClearing', () => {
    const c = (epochId: number, block: number): Clearing => ({
        epochId,
        block,
        timestamp: block,
    });

    it('takes the newest by block, then by epoch', () => {
        expect(
            pickOpeningClearing([c(5, 50), c(1, 80), c(6, 60)], [c(10, 100)]),
        ).toEqual(c(1, 80));
        expect(pickOpeningClearing([c(3, 70), c(4, 70)], [c(5, 100)])).toEqual(
            c(4, 70),
        );
    });

    it('allows the first in-window block itself (a catch-up block)', () => {
        expect(pickOpeningClearing([c(3, 100)], [c(4, 100)])).toEqual(
            c(3, 100),
        );
    });

    it('skips a clearing that finished after the first in-window one', () => {
        expect(pickOpeningClearing([c(2, 150), c(1, 90)], [c(9, 100)])).toEqual(
            c(1, 90),
        );
    });

    it('is null when nothing came before; any older one when the window has no clearing', () => {
        expect(pickOpeningClearing([], [c(9, 100)])).toBeNull();
        expect(pickOpeningClearing([c(2, 20)], [])).toEqual(c(2, 20));
    });
});
