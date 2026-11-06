import { BigNumber, providers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import {
    aggregateYieldHistory,
    YieldHistoryEntry,
} from '../../domain/yield-history';
import { CHAIN_CONFIGS } from '../../facade/chain-configs';
import { SdkConfig } from '../../sdk-config';
import { PoolOverview } from '../DataService/types';

import { Portfolio } from './portfolio';
import { lendingPortfolioQuery } from './queries';
import { LendingPortfolioQueryResult, PortfolioLendingPool } from './types';
import {
    fetchYieldHistorySeries,
    isEmptyHistoryError,
    isMissingEntityError,
    resolveYieldHistoryWindow,
    sharesAtInterest,
    trancheSharesAtInterest,
    YIELD_HISTORY_PAGE_SIZE,
    yieldHistoryPageQuery,
    YieldHistoryPageResult,
    yieldHistoryPositionsQuery,
    YieldHistoryPositionsResult,
} from './yield-history';

// ---------------------------------------------------------------------------
// A synthetic chain state, and a subgraph emulator that answers BOTH the
// portfolio query and the history queries from it by applying each query's own
// filters. Parity is therefore checked between two independent selections of
// the same data, not between a function and itself.
//
// Every address is synthetic (`0x…a001`), every amount a round number.
// ---------------------------------------------------------------------------

const USER = '0x0000000000000000000000000000000000000001';
const POOL_A = '0x000000000000000000000000000000000000a001';
const POOL_B = '0x000000000000000000000000000000000000b001';
const TRANCHE_A1 = '0x000000000000000000000000000000000000a011';
const TRANCHE_A2 = '0x000000000000000000000000000000000000a012';
const TRANCHE_B1 = '0x000000000000000000000000000000000000b011';
const LOCK_A1 = `${POOL_A}-1`;

const CURRENT_EPOCH = 10;
const EPOCH_ZERO_START = 1_000_000_000;
const EPOCH_DURATION = 604_800;

interface Update {
    epochId: number;
    shares: number | string;
    /**
     * When the subgraph wrote it. Default: during the clearing BEFORE its
     * tag — an update tagged E is written by clearing E − 1, the subgraph's
     * own rule for everything a clearing writes.
     */
    timestamp?: number;
}

/** A withdrawal the pool manager accepted (any lender), as the subgraph records it. */
interface Withdrawal {
    trancheId: string;
    /** The pool's clearing epoch when it was accepted. */
    epochId: number;
    createdOn: number;
    shares: string;
}

interface TrancheState {
    id: string;
    poolId: string;
    balanceNow: number;
    sharesNow: number;
    interest: Record<number, number | string>;
    trancheUpdates: Update[];
    userUpdates: Update[];
    lock?: {
        id: string;
        epochLockStart: number;
        epochLockEnd: number;
        initialShares: number | string;
        updates: Update[];
    };
    /** The chain's `userActiveAssets` for the lender, display units. Default 1000. */
    activeAssets?: string;
    /** The subgraph ledger's balance for the lender, display units. Default 1000. */
    ledgerBalance?: string;
}

interface ChainState {
    tranches: TrancheState[];
    /** Default `CURRENT_EPOCH`. */
    currentEpoch?: number;
    /**
     * Clearing starts per pool and epoch. Default: every pool cleared every
     * epoch before the current one, at `clearingAt(epoch)`.
     */
    clearings?: Record<string, Record<number, number>>;
    withdrawals?: Withdrawal[];
}

/** The default clearing time of an epoch: an hour before it ends. */
const clearingAt = (epoch: number): number =>
    EPOCH_ZERO_START + (epoch + 1) * EPOCH_DURATION - 3_600;

const currentOf = (state: ChainState): number =>
    state.currentEpoch ?? CURRENT_EPOCH;

function clearingsOf(
    state: ChainState,
): { poolId: string; epochId: number; start: number }[] {
    if (state.clearings) {
        return Object.entries(state.clearings).flatMap(([poolId, epochs]) =>
            Object.entries(epochs).map(([epoch, start]) => ({
                poolId,
                epochId: Number(epoch),
                start,
            })),
        );
    }
    return pools(state).flatMap((poolId) =>
        Array.from({ length: currentOf(state) }, (_, epochId) => ({
            poolId,
            epochId,
            start: clearingAt(epochId),
        })),
    );
}

/**
 * Pool A, tranche A1 holds a fixed-term lock topped up at clearings 8 and 9,
 * plus a post-clearing top-up tagged with the CURRENT epoch (10) — what the
 * subgraph holds between a clearing's end and the epoch rollover. Tranche A2
 * starts at epoch 9. Pool B comes after A, so a running total across pools
 * would show up in B's figure.
 */
function baseState(): ChainState {
    return {
        tranches: [
            {
                id: TRANCHE_A1,
                poolId: POOL_A,
                balanceNow: 13_000,
                sharesNow: 12_500,
                interest: { 6: 100, 7: 110, 8: 120, 9: 130 },
                trancheUpdates: [
                    { epochId: 5, shares: 10_000 },
                    { epochId: 8, shares: 12_000 },
                    { epochId: 10, shares: 12_500 },
                ],
                userUpdates: [
                    { epochId: 7, shares: 1_000 },
                    { epochId: 9, shares: 1_500 },
                    { epochId: 10, shares: 1_600 },
                ],
                lock: {
                    id: LOCK_A1,
                    epochLockStart: 6,
                    epochLockEnd: 20,
                    initialShares: 400,
                    updates: [
                        { epochId: 6, shares: 400 },
                        { epochId: 8, shares: 410 },
                        { epochId: 9, shares: 421 },
                        { epochId: 10, shares: 430 },
                    ],
                },
            },
            {
                id: TRANCHE_A2,
                poolId: POOL_A,
                balanceNow: 5_100,
                sharesNow: 5_000,
                interest: { 6: 50, 7: 50, 8: 50, 9: 50 },
                trancheUpdates: [{ epochId: 3, shares: 5_000 }],
                userUpdates: [{ epochId: 9, shares: 200 }],
            },
            {
                id: TRANCHE_B1,
                poolId: POOL_B,
                balanceNow: 4_200,
                sharesNow: 4_000,
                interest: { 7: 30, 8: 35, 9: 40 },
                trancheUpdates: [{ epochId: 2, shares: 4_000 }],
                userUpdates: [{ epochId: 8, shares: 500 }],
            },
        ],
    };
}

const positionId = (t: TrancheState): string => `${t.poolId}-${USER}-${t.id}`;

interface Row {
    id: string;
    epochId: string;
    shareUpdatesIndex: number;
    shares: string;
    timestamp: string;
}

const rows = (prefix: string, updates: Update[]): Row[] =>
    updates.map((u, index) => ({
        id: `${prefix}-${String(index).padStart(4, '0')}`,
        epochId: String(u.epochId),
        shareUpdatesIndex: index,
        shares: String(u.shares),
        timestamp: String(u.timestamp ?? clearingAt(u.epochId - 1)),
    }));

/** A share snapshot as the portfolio query selects it. */
const snapshot = ({
    epochId,
    shareUpdatesIndex,
    shares,
    timestamp,
}: Row): Omit<Row, 'id'> => ({ epochId, shareUpdatesIndex, shares, timestamp });

/** `orderBy: shareUpdatesIndex, desc, first: 1, where: { epochId_lt: bound }`, full rows */
function newestTaggedBefore(
    prefix: string,
    updates: Update[],
    bound: number,
): Omit<Row, 'id'>[] {
    return rows(prefix, updates)
        .filter((r) => Number(r.epochId) < bound)
        .sort((a, b) => b.shareUpdatesIndex - a.shareUpdatesIndex)
        .slice(0, 1)
        .map(snapshot);
}

/** `orderBy: shareUpdatesIndex, desc, where: { epochId_gte: bound }` */
function taggedFrom(
    prefix: string,
    updates: Update[],
    bound: number,
): Omit<Row, 'id'>[] {
    return rows(prefix, updates)
        .filter((r) => Number(r.epochId) >= bound)
        .sort((a, b) => b.shareUpdatesIndex - a.shareUpdatesIndex)
        .map(snapshot);
}

function withdrawalRows(state: ChainState): {
    id: string;
    epochId: string;
    createdOn: string;
    sharesAmount: string;
    tranche: { id: string };
}[] {
    return (state.withdrawals ?? []).map((w, index) => ({
        id: `w-${String(index).padStart(4, '0')}`,
        epochId: String(w.epochId),
        createdOn: String(w.createdOn),
        sharesAmount: w.shares,
        tranche: { id: w.trancheId },
    }));
}

function clearingRows(state: ChainState): {
    id: string;
    epochId: string;
    startTimestamp: string;
    lendingPool: { id: string };
}[] {
    return clearingsOf(state).map((c) => ({
        id: `${c.poolId}-${String(c.epochId).padStart(4, '0')}`,
        epochId: String(c.epochId),
        startTimestamp: String(c.start),
        lendingPool: { id: c.poolId },
    }));
}

/** `orderBy: shareUpdatesIndex, desc, first: 1, where: { epochId_lt: bound }` */
function latestBefore(
    prefix: string,
    updates: Update[],
    bound: number,
): { shares: string }[] {
    return rows(prefix, updates)
        .filter((r) => Number(r.epochId) < bound)
        .sort((a, b) => b.shareUpdatesIndex - a.shareUpdatesIndex)
        .slice(0, 1)
        .map(({ shares }) => ({ shares }));
}

function pools(state: ChainState): string[] {
    return [...new Set(state.tranches.map((t) => t.poolId))];
}

/** `lendingPortfolioQuery`, emulated from its filters. */
function lendingPortfolioResponse(
    state: ChainState,
    epochId: number,
    recentEpoch: number,
): LendingPortfolioQueryResult {
    const lastEpochId = epochId - 1;
    const recent = (epoch: string): boolean =>
        Number(epoch) >= recentEpoch && Number(epoch) < epochId;
    return {
        lendingPoolClearings: clearingRows(state).filter((c) =>
            recent(c.epochId),
        ),
        recentWithdrawalsAccepted: withdrawalRows(state).filter((w) =>
            recent(w.epochId),
        ),
        user: {
            lendingPoolUserDetails: pools(state).map((poolId) => ({
                id: `${poolId}-${USER}`,
                lendingPool: {
                    id: poolId,
                    name: 'Synthetic',
                    balance: '0',
                    configuration: {
                        lendingPoolWithdrawalConfig: {
                            requestEpochsInAdvance: '1',
                            cancelRequestEpochsInAdvance: '1',
                        },
                    },
                    tranches: [],
                },
                lendingPoolTrancheUserDetails: state.tranches
                    .filter((t) => t.poolId === poolId)
                    .map((t) => ({
                        shares: String(t.userUpdates.at(-1)?.shares ?? 0),
                        lendingPoolTrancheUserEpochSharesUpdates:
                            newestTaggedBefore(
                                positionId(t),
                                t.userUpdates,
                                recentEpoch,
                            ),
                        recentUserShareUpdates: taggedFrom(
                            positionId(t),
                            t.userUpdates,
                            recentEpoch,
                        ),
                        userLendingPoolTrancheFixedTermDepositLocks: t.lock
                            ? [
                                  {
                                      isLocked: true,
                                      unlockAmount: null,
                                      initialAmount: String(
                                          t.lock.initialShares,
                                      ),
                                      lockId: '1',
                                      initialTrancheShares: String(
                                          t.lock.initialShares,
                                      ),
                                      isWithdrawalRequested: false,
                                      createdOn: '1000000000',
                                      epochLockStart: String(
                                          t.lock.epochLockStart,
                                      ),
                                      epochLockEnd: String(t.lock.epochLockEnd),
                                      trancheShares: String(
                                          t.lock.updates.at(-1)?.shares ?? 0,
                                      ),
                                      lendingPoolTrancheFixedTermConfig: {
                                          epochLockDuration: '13',
                                          configId: '1',
                                          epochInterestRate: '0.003',
                                      },
                                      userLendingPoolTrancheFixedTermDepositLockShareUpdate:
                                          latestBefore(
                                              'l',
                                              t.lock.updates,
                                              lastEpochId,
                                          ),
                                      lockSharesAtLastEpoch: latestBefore(
                                          'l',
                                          t.lock.updates,
                                          epochId,
                                      ),
                                  },
                              ]
                            : [],
                        totalAcceptedDeposits: '0',
                        totalAcceptedWithdrawnAmount: '0',
                        tranche: {
                            id: t.id,
                            shares: String(t.sharesNow),
                            balance: String(t.balanceNow),
                            lendingPoolTrancheShareUpdates: newestTaggedBefore(
                                t.id,
                                t.trancheUpdates,
                                recentEpoch,
                            ),
                            recentTrancheShareUpdates: taggedFrom(
                                t.id,
                                t.trancheUpdates,
                                recentEpoch,
                            ),
                            lendingPoolTrancheEpochInterest: Object.entries(
                                t.interest,
                            )
                                .filter(([e]) => Number(e) < epochId)
                                .sort(([a], [b]) => Number(b) - Number(a))
                                .slice(0, 1)
                                .map(([e, amount]) => ({
                                    epochId: e,
                                    epochInterestAmount: String(amount),
                                })),
                        },
                    })),
            })),
        },
        userRequests: [],
    };
}

function positionsResponse(state: ChainState): YieldHistoryPositionsResult {
    return {
        user: {
            lendingPoolUserDetails: pools(state).map((poolId) => ({
                lendingPool: { id: poolId },
                lendingPoolTrancheUserDetails: state.tranches
                    .filter((t) => t.poolId === poolId)
                    .map((t) => ({
                        id: positionId(t),
                        tranche: {
                            id: t.id,
                            balance: String(t.balanceNow),
                            shares: String(t.sharesNow),
                        },
                        userLendingPoolTrancheFixedTermDepositLocks: t.lock
                            ? [
                                  {
                                      id: t.lock.id,
                                      epochLockStart: String(
                                          t.lock.epochLockStart,
                                      ),
                                      epochLockEnd: String(t.lock.epochLockEnd),
                                      initialTrancheShares: String(
                                          t.lock.initialShares,
                                      ),
                                  },
                              ]
                            : [],
                    })),
            })),
        },
    };
}

/** `first: $first, orderBy: id asc, where: { id_gt: cursor, … }` */
function page<T extends { id: string }>(
    all: T[],
    cursor: string,
    first: number,
): T[] {
    return all
        .filter((r) => r.id > cursor)
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
        .slice(0, first);
}

/** `yieldHistoryPageQuery`, emulated from its filters and `@include` flags. */
function pageResponse(
    state: ChainState,
    v: Record<string, unknown>,
): YieldHistoryPageResult {
    const tranches = v.tranches as string[];
    const userTranches = v.userTranches as string[];
    const locks = v.locks as string[];
    const from = Number(v.fromEpoch);
    const to = Number(v.toEpoch);
    const result: YieldHistoryPageResult = {};

    if (v.withInterest) {
        result.interest = page(
            state.tranches
                .filter((t) => tranches.includes(t.id))
                .flatMap((t) =>
                    Object.entries(t.interest).map(([e, amount]) => ({
                        id: `${t.id}-${e.padStart(4, '0')}`,
                        epochId: e,
                        epochInterestAmount: String(amount),
                        lendingPoolTranche: { id: t.id },
                    })),
                )
                .filter((r) => Number(r.epochId) >= from)
                .filter((r) => Number(r.epochId) <= to),
            v.interestCursor as string,
            Number(v.first),
        );
    }
    if (v.withTrancheShares) {
        result.trancheShares = page(
            state.tranches
                .filter((t) => tranches.includes(t.id))
                .flatMap((t) =>
                    rows(t.id, t.trancheUpdates).map((r) => ({
                        ...r,
                        lendingPoolTranche: { id: t.id },
                    })),
                )
                .filter((r) => Number(r.epochId) <= to),
            v.trancheSharesCursor as string,
            Number(v.first),
        );
    }
    if (v.withUserShares) {
        result.userShares = page(
            state.tranches
                .filter((t) => userTranches.includes(positionId(t)))
                .flatMap((t) =>
                    rows(positionId(t), t.userUpdates).map((r) => ({
                        ...r,
                        lendingPoolTrancheUserDetails: { id: positionId(t) },
                    })),
                )
                .filter(
                    (r) => Number(r.epochId) <= Number(v.userSharesToEpoch),
                ),
            v.userSharesCursor as string,
            Number(v.first),
        );
    }
    if (v.withClearings) {
        const poolIds = v.pools as string[];
        result.clearings = page(
            clearingRows(state)
                .filter((c) => poolIds.includes(c.lendingPool.id))
                .filter((c) => Number(c.epochId) >= from)
                .filter((c) => Number(c.epochId) <= to),
            v.clearingsCursor as string,
            Number(v.first),
        );
    }
    if (v.withWithdrawals) {
        result.withdrawals = page(
            withdrawalRows(state)
                .filter((w) => tranches.includes(w.tranche.id))
                .filter((w) => Number(w.epochId) >= from)
                .filter((w) => Number(w.epochId) <= to),
            v.withdrawalsCursor as string,
            Number(v.first),
        );
    }
    if (v.withLockShares) {
        result.lockShares = page(
            state.tranches
                .flatMap((t) => (t.lock ? [t.lock] : []))
                .filter((lock) => locks.includes(lock.id))
                .flatMap((lock) =>
                    rows(lock.id, lock.updates).map((r) => ({
                        ...r,
                        userLendingPoolTrancheFixedTermDepositLock: {
                            id: lock.id,
                        },
                    })),
                )
                .filter((r) => Number(r.epochId) <= to),
            v.lockSharesCursor as string,
            Number(v.first),
        );
    }
    return result;
}

type GraphRequest = jest.Mock<
    Promise<unknown>,
    [string, Record<string, unknown>]
>;

interface Harness {
    portfolio: Portfolio;
    request: GraphRequest;
    contractReads: jest.Mock;
    /** `UserLending.getUserTrancheActiveAssets` — the per-tranche chain reads. */
    activeAssetReads: jest.Mock;
    poolOverviews: PoolOverview[];
}

function harness(
    state: ChainState,
    graph?: (document: string, variables: Record<string, unknown>) => unknown,
    deployment: 'full' | 'lite' = 'full',
): Harness {
    const chain = CHAIN_CONFIGS[deployment === 'lite' ? 'xdc' : 'base'];
    const config = new SdkConfig({
        subgraphUrl: 'https://example.invalid/subgraph',
        contracts: chain.contracts,
        UNUSED_LENDING_POOL_IDS: [''],
        isLiteDeployment: deployment === 'lite',
    });
    const portfolio = new Portfolio(
        config,
        new providers.StaticJsonRpcProvider(chain.rpcUrls[0], chain.chainId),
    );

    const request: GraphRequest = jest.fn(
        (document: string, variables: Record<string, unknown>) => {
            // Every query sizes its lists with the one page-size constant.
            if (variables.first !== YIELD_HISTORY_PAGE_SIZE) {
                return Promise.reject(new Error('missing $first'));
            }
            if (graph) return Promise.resolve(graph(document, variables));
            if (document === lendingPortfolioQuery) {
                return Promise.resolve(
                    lendingPortfolioResponse(
                        state,
                        Number(variables.epochId),
                        Number(variables.recentEpoch),
                    ),
                );
            }
            if (document === yieldHistoryPositionsQuery) {
                return Promise.resolve(positionsResponse(state));
            }
            if (document === yieldHistoryPageQuery) {
                return Promise.resolve(pageResponse(state, variables));
            }
            return Promise.reject(new Error('unexpected query'));
        },
    );

    const internals = portfolio as unknown as {
        _graph: unknown;
        _systemVariablesAbi: unknown;
        _userLendingService: Record<string, unknown>;
    };
    internals._graph = { request };
    const contractReads = jest.fn();
    internals._systemVariablesAbi = {
        currentEpochNumber: (): Promise<BigNumber> => {
            contractReads('currentEpochNumber');
            return Promise.resolve(BigNumber.from(currentOf(state)));
        },
        epochStartTimestamp: (epoch: number): Promise<BigNumber> => {
            contractReads('epochStartTimestamp');
            return Promise.resolve(
                BigNumber.from(EPOCH_ZERO_START + epoch * EPOCH_DURATION),
            );
        },
        epochDuration: (): Promise<BigNumber> => {
            contractReads('epochDuration');
            return Promise.resolve(BigNumber.from(EPOCH_DURATION));
        },
    };
    internals._userLendingService.getPortfolioUserTrancheBalances = (): Promise<
        Map<
            string,
            { trancheId: string; userBalance: string; yieldEarned: number }[]
        >
    > =>
        Promise.resolve(
            new Map(
                pools(state).map((poolId) => [
                    poolId,
                    state.tranches
                        .filter((t) => t.poolId === poolId)
                        .map((t) => ({
                            trancheId: t.id,
                            userBalance: t.ledgerBalance ?? '1000',
                            yieldEarned: 10,
                        })),
                ]),
            ),
        );
    // The chain: `LendingPool.userBalance` is the sum of the tranches'
    // `userActiveAssets` (6-decimal base units).
    const activeAssets = (t: TrancheState): BigNumber =>
        parseUnits(t.activeAssets ?? '1000', 6);
    internals._userLendingService.getUserPoolBalance = (): Promise<
        { poolId: string; balance: BigNumber; yieldEarned: number }[]
    > =>
        Promise.resolve(
            pools(state).map((poolId) => ({
                poolId,
                balance: state.tranches
                    .filter((t) => t.poolId === poolId)
                    .reduce(
                        (sum, t) => sum.add(activeAssets(t)),
                        BigNumber.from(0),
                    ),
                yieldEarned: 10,
            })),
        );
    const activeAssetReads = jest.fn(
        (_user: string, trancheIds: readonly string[]): Promise<BigNumber[]> =>
            Promise.resolve(
                trancheIds.map((id) => {
                    const t = state.tranches.find((x) => x.id === id);
                    return t ? activeAssets(t) : BigNumber.from(0);
                }),
            ),
    );
    internals._userLendingService.getUserTrancheActiveAssets = activeAssetReads;

    const poolOverviews = pools(state).map(
        (poolId) =>
            ({
                id: poolId,
                tranches: state.tranches
                    .filter((t) => t.poolId === poolId)
                    .map((t) => ({ id: t.id })),
            }) as unknown as PoolOverview,
    );

    return {
        portfolio,
        request,
        contractReads,
        activeAssetReads,
        poolOverviews,
    };
}

function trancheLastEpoch(
    pool: PortfolioLendingPool,
    trancheId: string,
): number {
    const tranche = pool.tranches.find((t) => t.id === trancheId);
    if (!tranche) throw new Error(`no tranche ${trancheId}`);
    return tranche.fixedLoans.reduce(
        (sum, loan) => sum + parseFloat(loan.yieldEarnings.lastEpoch),
        parseFloat(tranche.yieldEarnings.lastEpoch),
    );
}

async function bothReads(state: ChainState): Promise<{
    lending: PortfolioLendingPool[];
    history: YieldHistoryEntry[];
    pool: (id: string) => PortfolioLendingPool;
}> {
    const { portfolio, poolOverviews } = harness(state);
    const [lending, history] = await Promise.all([
        portfolio.getPortfolioLendingData(
            USER,
            poolOverviews,
            String(currentOf(state)),
        ),
        portfolio.getYieldHistory(USER),
    ]);
    const pool = (id: string): PortfolioLendingPool => {
        const found = lending.find((p) => p.id === id);
        if (!found) throw new Error(`no pool ${id}`);
        return found;
    };
    return { lending, history, pool };
}

// ---------------------------------------------------------------------------

describe('getYieldHistory — parity with the last-epoch figures', () => {
    it('the newest entry of every tranche equals getPortfolioLendingData', async () => {
        const { history, pool } = await bothReads(baseState());

        for (const [poolId, trancheId] of [
            [POOL_A, TRANCHE_A1],
            [POOL_A, TRANCHE_A2],
            [POOL_B, TRANCHE_B1],
        ] as const) {
            const newest = history
                .filter((e) => e.trancheId === trancheId)
                .at(-1);
            expect(newest?.epochId).toBe(CURRENT_EPOCH - 1);
            expect(newest?.netYield).toBe(
                trancheLastEpoch(pool(poolId), trancheId),
            );
        }
    });

    it('the newest aggregated bar of a strategy equals its totalYieldEarningsLastEpoch', async () => {
        const { history, pool } = await bothReads(baseState());
        for (const poolId of [POOL_A, POOL_B]) {
            const bars = aggregateYieldHistory(history, { poolId });
            expect(bars.at(-1)?.netYield).toBeCloseTo(
                parseFloat(pool(poolId).totalYieldEarningsLastEpoch),
                10,
            );
        }
    });

    it('pins the figures by hand, so parity cannot hold on a shared mistake', async () => {
        const { history, pool } = await bothReads(baseState());
        // A1 @ 9: base = 130 × 1500 / 12000 = 16.25; the lock's top-up at
        // clearing 9 is 421 − 410 = 11 shares × 13000 / 12500 = 11.44.
        // The post-clearing update tagged epoch 10 (430 shares) is NOT in it.
        const a1 = history.filter((e) => e.trancheId === TRANCHE_A1).at(-1);
        expect(a1?.netYield).toBeCloseTo(16.25 + 11.44, 10);
        // A2 @ 9: 50 × 200 / 5000 = 2. B1 @ 9: 40 × 500 / 4000 = 5.
        expect(
            history.filter((e) => e.trancheId === TRANCHE_A2).at(-1)?.netYield,
        ).toBeCloseTo(2, 12);
        expect(
            history.filter((e) => e.trancheId === TRANCHE_B1).at(-1)?.netYield,
        ).toBeCloseTo(5, 12);
        // Each pool's own total — the lock counted once, no carry-over from
        // the pool before it.
        expect(
            parseFloat(pool(POOL_A).totalYieldEarningsLastEpoch),
        ).toBeCloseTo(16.25 + 11.44 + 2, 10);
        expect(
            parseFloat(pool(POOL_B).totalYieldEarningsLastEpoch),
        ).toBeCloseTo(5, 12);
    });
});

describe('getYieldHistory — a lock made after a clearing', () => {
    /**
     * A manual lock made after clearing 8 has `epochLockStart` 8, but its
     * first share update is tagged 9. At epoch 9 it is active (8 < 9), and NO
     * snapshot exists before 9: the "shares before" must be the lock's
     * opening shares, or its whole principal is booked as a top-up.
     */
    function lateLockState(): ChainState {
        const state = baseState();
        const a1 = state.tranches[0];
        if (!a1.lock) throw new Error('fixture');
        a1.lock = {
            id: LOCK_A1,
            epochLockStart: 8,
            epochLockEnd: 20,
            initialShares: 400,
            updates: [{ epochId: 9, shares: 400 }],
        };
        return state;
    }

    it('books no top-up, in the history AND in the last-epoch figures', async () => {
        const { history, pool } = await bothReads(lateLockState());
        // A1 @ 9: base 130 × 1500 / 12000 = 16.25, top-up 0 (400 − 400).
        // Without the fallback both would add 400 × 13000 / 12500 = 416.
        const a1 = history.filter((e) => e.trancheId === TRANCHE_A1).at(-1);
        expect(a1?.epochId).toBe(9);
        expect(a1?.netYield).toBeCloseTo(16.25, 10);
        expect(trancheLastEpoch(pool(POOL_A), TRANCHE_A1)).toBeCloseTo(
            16.25,
            10,
        );
        expect(a1?.netYield).toBe(trancheLastEpoch(pool(POOL_A), TRANCHE_A1));
    });
});

describe('getYieldHistory — entries', () => {
    it('lists only epochs in which the lender held shares', async () => {
        const { history } = await bothReads(baseState());
        const epochsOf = (trancheId: string): number[] =>
            history
                .filter((e) => e.trancheId === trancheId)
                .map((e) => e.epochId);
        expect(epochsOf(TRANCHE_A1)).toEqual([7, 8, 9]);
        expect(epochsOf(TRANCHE_A2)).toEqual([9]);
        expect(epochsOf(TRANCHE_B1)).toEqual([8, 9]);
    });

    it('dates each epoch by its end: the next epoch start', async () => {
        const { history } = await bothReads(baseState());
        for (const e of history) {
            expect(e.epochEnd).toBe(
                EPOCH_ZERO_START + (e.epochId + 1) * EPOCH_DURATION,
            );
        }
    });

    it('carries the net figure only — no gross on an entry', async () => {
        const { history } = await bothReads(baseState());
        expect(history.length).toBeGreaterThan(0);
        for (const e of history) {
            expect(Object.keys(e).sort()).toEqual([
                'epochEnd',
                'epochId',
                'netYield',
                'poolId',
                'trancheId',
            ]);
            expect(Number.isFinite(e.netYield)).toBe(true);
        }
    });

    it('is sorted by epoch, then pool, then tranche', async () => {
        const { history } = await bothReads(baseState());
        const keys = history.map(
            (e) => `${e.epochId}|${e.poolId}|${e.trancheId}`,
        );
        expect(keys).toEqual(
            [...keys].sort((a, b) => {
                const [ea, ...ra] = a.split('|');
                const [eb, ...rb] = b.split('|');
                return (
                    Number(ea) - Number(eb) ||
                    ra.join().localeCompare(rb.join())
                );
            }),
        );
    });

    it('is empty for a lender the subgraph does not know', async () => {
        const { portfolio } = harness(baseState(), (document) =>
            document === yieldHistoryPositionsQuery ? { user: null } : {},
        );
        await expect(portfolio.getYieldHistory(USER)).resolves.toEqual([]);
    });

    it('lowercases the address it asks the subgraph for', async () => {
        const { portfolio, request } = harness(baseState());
        await portfolio.getYieldHistory(
            '0xAbCdEf0000000000000000000000000000000001',
        );
        expect(request.mock.calls[0]?.[1]).toMatchObject({
            userAddress: '0xabcdef0000000000000000000000000000000001',
        });
    });
});

describe('getYieldHistory — window', () => {
    it('count = the newest settled epochs', async () => {
        const { portfolio } = harness(baseState());
        const history = await portfolio.getYieldHistory(USER, { count: 2 });
        expect([...new Set(history.map((e) => e.epochId))]).toEqual([8, 9]);
    });

    it('fromEpoch + count = an exact slice', async () => {
        const { portfolio } = harness(baseState());
        const history = await portfolio.getYieldHistory(USER, {
            fromEpoch: 8,
            count: 1,
        });
        expect([...new Set(history.map((e) => e.epochId))]).toEqual([8]);
    });

    it('a windowed entry equals the same entry of the full history', async () => {
        const { portfolio } = harness(baseState());
        const full = await portfolio.getYieldHistory(USER);
        const slice = await portfolio.getYieldHistory(USER, {
            fromEpoch: 8,
            count: 1,
        });
        expect(slice).toEqual(full.filter((e) => e.epochId === 8));
    });

    it('a window past the newest settled epoch is empty', async () => {
        const { portfolio } = harness(baseState());
        await expect(
            portfolio.getYieldHistory(USER, { fromEpoch: CURRENT_EPOCH }),
        ).resolves.toEqual([]);
    });

    it('refuses a malformed window before any network read', async () => {
        const { portfolio, request, contractReads } = harness(baseState());
        await expect(
            portfolio.getYieldHistory(USER, { count: 0 }),
        ).rejects.toThrow(RangeError);
        await expect(
            portfolio.getYieldHistory(USER, { fromEpoch: -1 }),
        ).rejects.toThrow(RangeError);
        await expect(
            portfolio.getYieldHistory(USER, { count: 1.5 }),
        ).rejects.toThrow(RangeError);
        expect(request).not.toHaveBeenCalled();
        expect(contractReads).not.toHaveBeenCalled();
    });
});

describe('resolveYieldHistoryWindow', () => {
    it.each([
        [{}, 10, { fromEpoch: 0, toEpoch: 9 }],
        [{ count: 4 }, 10, { fromEpoch: 6, toEpoch: 9 }],
        [{ count: 50 }, 10, { fromEpoch: 0, toEpoch: 9 }],
        [{ fromEpoch: 3 }, 10, { fromEpoch: 3, toEpoch: 9 }],
        [{ fromEpoch: 3, count: 2 }, 10, { fromEpoch: 3, toEpoch: 4 }],
        [{ fromEpoch: 8, count: 5 }, 10, { fromEpoch: 8, toEpoch: 9 }],
        [{ fromEpoch: 10 }, 10, null],
        [{}, 0, null],
    ])('%j at epoch %i → %j', (options, current, expected) => {
        expect(resolveYieldHistoryWindow(options, current)).toEqual(expected);
    });
});

describe('getYieldHistory — deployments without the entities', () => {
    const missing = (message: string): Error =>
        Object.assign(new Error(message), {
            response: { errors: [{ message }], status: 200 },
        });

    const MISSING = [
        'Type `Query` has no field `lendingPoolTrancheEpochInterests`',
        'Cannot query field "userLendingPoolTrancheFtdLockShareUpdates" on type "Query".',
        'Unknown argument "epochId_lte" on field "Query.lendingPoolTrancheShareUpdates"',
    ];

    it.each(MISSING)(
        'Lite: returns [] on a validation error: %s',
        async (message) => {
            const { portfolio } = harness(
                baseState(),
                () => {
                    throw missing(message);
                },
                'lite',
            );
            await expect(portfolio.getYieldHistory(USER)).resolves.toEqual([]);
        },
    );

    it.each(MISSING)(
        'full deployment: THROWS on the same validation error: %s',
        async (message) => {
            const { portfolio } = harness(baseState(), () => {
                throw missing(message);
            });
            await expect(portfolio.getYieldHistory(USER)).rejects.toThrow(
                message,
            );
        },
    );

    it('Lite: returns [] when only the page query is missing the entities; full throws', async () => {
        const state = baseState();
        const graph = (document: string): unknown => {
            if (document === yieldHistoryPositionsQuery) {
                return positionsResponse(state);
            }
            throw missing(
                'Type `Query` has no field `lendingPoolTrancheUserEpochSharesUpdates`',
            );
        };
        await expect(
            harness(state, graph, 'lite').portfolio.getYieldHistory(USER),
        ).resolves.toEqual([]);
        await expect(
            harness(state, graph).portfolio.getYieldHistory(USER),
        ).rejects.toThrow('has no field');
    });

    it('isEmptyHistoryError is the Lite gate over isMissingEntityError', () => {
        const error = missing('Type `Query` has no field `x`');
        expect(isEmptyHistoryError(error, true)).toBe(true);
        expect(isEmptyHistoryError(error, false)).toBe(false);
        expect(isEmptyHistoryError(new Error('fetch failed'), true)).toBe(
            false,
        );
    });

    it('still throws on a network or indexing failure, even on Lite', async () => {
        const { portfolio } = harness(
            baseState(),
            () => {
                throw new Error('fetch failed');
            },
            'lite',
        );
        await expect(portfolio.getYieldHistory(USER)).rejects.toThrow(
            'fetch failed',
        );

        const indexing = harness(
            baseState(),
            () => {
                throw Object.assign(new Error('indexing'), {
                    response: {
                        errors: [
                            { message: 'indexing_error: subgraph failed' },
                        ],
                    },
                });
            },
            'lite',
        );
        await expect(indexing.portfolio.getYieldHistory(USER)).rejects.toThrow(
            'indexing',
        );
    });

    it('isMissingEntityError needs EVERY error to be a missing-schema one', () => {
        expect(
            isMissingEntityError({
                response: {
                    errors: [
                        { message: 'Type `Query` has no field `x`' },
                        { message: 'store error: timeout' },
                    ],
                },
            }),
        ).toBe(false);
        expect(isMissingEntityError(new Error('no response'))).toBe(false);
        expect(isMissingEntityError(null)).toBe(false);
    });
});

describe('getYieldHistory — bounded round trips', () => {
    it('costs two subgraph requests for a normal history, never one per epoch', async () => {
        const { portfolio, request } = harness(baseState());
        await portfolio.getYieldHistory(USER);
        expect(request).toHaveBeenCalledTimes(2);
        expect(request.mock.calls.map(([document]) => document)).toEqual([
            yieldHistoryPositionsQuery,
            yieldHistoryPageQuery,
        ]);
    });

    it('paginates the longest series and stops asking for the exhausted ones', async () => {
        const state = baseState();
        const a1 = state.tranches[0];
        // 2 300 tranche share snapshots before the lender's first epoch: three
        // pages of that series, one page of everything else.
        a1.trancheUpdates = [
            ...Array.from({ length: 2_300 }, () => ({
                epochId: 1,
                shares: 10_000,
            })),
            ...a1.trancheUpdates,
        ];

        const { portfolio, request } = harness(state);
        const paged = await portfolio.getYieldHistory(USER);

        const pages = request.mock.calls.filter(
            ([document]) => document === yieldHistoryPageQuery,
        );
        expect(pages).toHaveLength(3);
        expect(pages[0]?.[1]).toMatchObject({
            withInterest: true,
            withTrancheShares: true,
            withUserShares: true,
            withLockShares: true,
            trancheSharesCursor: '',
        });
        expect(pages[1]?.[1]).toMatchObject({
            withInterest: false,
            withTrancheShares: true,
            withUserShares: false,
            withLockShares: false,
        });
        expect(
            (pages[1]?.[1] as Record<string, string>).trancheSharesCursor,
        ).not.toBe('');

        // The extra snapshots change nothing: the same history as without them.
        const { portfolio: plain } = harness(baseState());
        expect(paged).toEqual(await plain.getYieldHistory(USER));
    });

    it('refuses a cursor that does not advance', async () => {
        const full = Array.from({ length: YIELD_HISTORY_PAGE_SIZE }, () => ({
            id: 'same',
            epochId: '1',
            epochInterestAmount: '1',
            lendingPoolTranche: { id: TRANCHE_A1 },
        }));
        await expect(
            fetchYieldHistorySeries(
                (v) =>
                    Promise.resolve({
                        interest: v.withInterest ? full : undefined,
                    }),
                {
                    pools: [POOL_A],
                    tranches: [TRANCHE_A1],
                    userTranches: [],
                    locks: [],
                },
                { fromEpoch: 0, toEpoch: 9 },
            ),
        ).rejects.toThrow('did not advance');
    });

    it('skips the page request when the lender holds no tranche', async () => {
        const { portfolio, request } = harness(baseState(), (document) =>
            document === yieldHistoryPositionsQuery
                ? {
                      user: { lendingPoolUserDetails: [] },
                  }
                : {},
        );
        await expect(portfolio.getYieldHistory(USER)).resolves.toEqual([]);
        expect(request).toHaveBeenCalledTimes(1);
    });
});

// ---------------------------------------------------------------------------
// Pairing each cycle's interest with the shares it was applied to.
//
// The shapes below are real Base subgraph rows (share counts, interest,
// block times), with every address replaced by a synthetic one.
// ---------------------------------------------------------------------------

const POOL_C = '0x000000000000000000000000000000000000c001';
const TRANCHE_C1 = '0x000000000000000000000000000000000000c011';
const TRANCHE_C2 = '0x000000000000000000000000000000000000c012';

/**
 * A withdrawal of 73 752.12 shares the pool manager accepted BETWEEN
 * clearings 122 and 123 (`forceAcceptWithdrawalRequest`). The subgraph tags
 * the withdrawer's update 124 — as if clearing 123 had accepted it — and
 * writes no tranche snapshot, so the tranche reads 306 598.81 shares until
 * clearing 123 ends. Clearing 123 applied 740.18 of interest to what was
 * left: 232 846.69 shares, exactly the snapshot it wrote at its end.
 */
function offClearingWithdrawalState(
    lender: 'holder' | 'withdrawer',
): ChainState {
    return {
        currentEpoch: 124,
        clearings: {
            [POOL_C]: { 121: 1791345715, 122: 1791946585, 123: 1792648817 },
        },
        withdrawals: [
            {
                trancheId: TRANCHE_C1,
                epochId: 123,
                createdOn: 1792116301,
                shares: '73752.115424943068426361',
            },
        ],
        tranches: [
            {
                id: TRANCHE_C1,
                poolId: POOL_C,
                balanceNow: 250494.450139,
                sharesNow: Number('200987.76929789310479339'),
                interest: { 122: '972.128436', 123: '740.176373' },
                trancheUpdates: [
                    {
                        epochId: 122,
                        shares: '306598.81009980747452684',
                        timestamp: 1791345715,
                    },
                    {
                        epochId: 123,
                        shares: '306598.81009980747452684',
                        timestamp: 1791946585,
                    },
                    {
                        epochId: 124,
                        shares: '232846.694674864406100479',
                        timestamp: 1792648817,
                    },
                ],
                userUpdates:
                    lender === 'holder'
                        ? [
                              {
                                  epochId: 117,
                                  shares: '92.543439747524617315',
                                  timestamp: 1788325749,
                              },
                              {
                                  epochId: 118,
                                  shares: '211.807088222242248242',
                                  timestamp: 1789018541,
                              },
                          ]
                        : [
                              {
                                  epochId: 97,
                                  shares: '73752.115424943068426361',
                                  timestamp: 1776037813,
                              },
                              {
                                  epochId: 124,
                                  shares: '0',
                                  timestamp: 1792116301,
                              },
                          ],
            },
        ],
    };
}

/**
 * A fixed-term lock of 431.00 shares whose recorded shares were set to 0 at
 * clearing 80 (no withdrawal, no top-up event moving them) while the shares
 * stayed in the fixed-term contract. Read as a top-up, that is −431 shares of
 * "yield" — −553 at today's price, for a 500 deposit.
 */
function zeroedLockState(): ChainState {
    return {
        currentEpoch: 81,
        clearings: { [POOL_C]: { 79: 1765937461, 80: 1766548897 } },
        tranches: [
            {
                id: TRANCHE_C2,
                poolId: POOL_C,
                balanceNow: 2631644.85667,
                sharesNow: Number('2049088.940978179611446023'),
                interest: { 79: '3871.057382', 80: '4339.402805' },
                trancheUpdates: [
                    {
                        epochId: 79,
                        shares: '1477944.280878656768618317',
                        timestamp: 1765433155,
                    },
                    {
                        epochId: 80,
                        shares: '1942647.088035513996278627',
                        timestamp: 1765937461,
                    },
                    {
                        epochId: 80,
                        shares: '1653014.919696082472702442',
                        timestamp: 1766009997,
                    },
                    {
                        epochId: 81,
                        shares: '1784374.252504025714212697',
                        timestamp: 1766548897,
                    },
                ],
                userUpdates: [
                    {
                        epochId: 80,
                        shares: '431.000250505106433893',
                        timestamp: 1765937461,
                    },
                    { epochId: 81, shares: '0', timestamp: 1766548897 },
                ],
                lock: {
                    id: `${POOL_C}-1`,
                    epochLockStart: 79,
                    epochLockEnd: 92,
                    initialShares: '431.000250505106433893',
                    updates: [
                        {
                            epochId: 79,
                            shares: '431.000250505106433893',
                            timestamp: 1765937461,
                        },
                        { epochId: 80, shares: '0', timestamp: 1766548897 },
                    ],
                },
            },
        ],
    };
}

/**
 * Shares moved between wallets outside a deposit or withdrawal. The
 * subgraph ledger does not follow the move: the receiving wallet's ledger
 * goes NEGATIVE as it withdraws (−861.998, then −30 017.29 shares), and the
 * sending wallet keeps the shares on the ledger. The chain holds neither.
 */
function movedSharesState(side: 'received' | 'sent'): ChainState {
    return {
        currentEpoch: 103,
        tranches: [
            {
                id: TRANCHE_C1,
                poolId: POOL_C,
                balanceNow: 250494.450139,
                sharesNow: Number('200987.76929789310479339'),
                interest: {
                    99: '972.1',
                    100: '968.4',
                    101: '960.2',
                    102: '958.8',
                },
                trancheUpdates: [{ epochId: 95, shares: '306598.81' }],
                userUpdates:
                    side === 'received'
                        ? [
                              {
                                  epochId: 99,
                                  shares: '-861.998232423727442722',
                                  timestamp: 1777253435,
                              },
                              {
                                  epochId: 101,
                                  shares: '-30017.2882178693575841',
                                  timestamp: 1778119317,
                              },
                          ]
                        : [{ epochId: 90, shares: '30879.286450293085026822' }],
                ledgerBalance:
                    side === 'received'
                        ? '-37411.053085795351083519'
                        : '37411.053085795351083519',
                activeAssets: '0',
            },
        ],
    };
}

function only(lending: PortfolioLendingPool[]): PortfolioLendingPool {
    expect(lending).toHaveLength(1);
    return lending[0];
}

describe('getYieldHistory — interest paired with the shares it was applied to', () => {
    it('a withdrawal accepted between clearings leaves the tranche before the next interest', async () => {
        const { history, lending } = await bothReads(
            offClearingWithdrawalState('holder'),
        );
        // 122: the withdrawal had not happened — 306 598.81 shares.
        // 123: it had — 232 846.69. The epoch tag alone reads 306 598.81 at
        // 123 too, and books 0.5113 instead of 0.6733.
        const byEpoch = new Map(history.map((e) => [e.epochId, e.netYield]));
        expect(byEpoch.get(122)).toBeCloseTo(
            (972.128436 * Number('211.807088222242248242')) /
                Number('306598.81009980747452684'),
            10,
        );
        expect(byEpoch.get(123)).toBeCloseTo(
            (740.176373 * Number('211.807088222242248242')) /
                Number('232846.694674864406100479'),
            10,
        );
        expect(byEpoch.get(123)).toBeCloseTo(0.6733, 4);
        // getPositions' last-epoch figure ("Earned last cycle") is the same.
        expect(
            parseFloat(only(lending).totalYieldEarningsLastEpoch),
        ).toBeCloseTo(byEpoch.get(123) ?? NaN, 10);
    });

    it('the withdrawer earns nothing at the clearing after the withdrawal', async () => {
        const { history, lending } = await bothReads(
            offClearingWithdrawalState('withdrawer'),
        );
        expect(history.map((e) => e.epochId)).toEqual([122]);
        expect(history[0]?.netYield).toBeCloseTo(
            (972.128436 * Number('73752.115424943068426361')) /
                Number('306598.81009980747452684'),
            8,
        );
        // Not 740.18 × 73 752 / 306 599 = 178.05 for shares already gone.
        expect(only(lending).totalYieldEarningsLastEpoch).toBe('0');
    });

    it('every share of the tranche is credited once: holder + withdrawer = the shares in force', async () => {
        const holder = await bothReads(offClearingWithdrawalState('holder'));
        const withdrawer = await bothReads(
            offClearingWithdrawalState('withdrawer'),
        );
        const at = (h: YieldHistoryEntry[], e: number): number =>
            h.find((x) => x.epochId === e)?.netYield ?? 0;
        // At 123 the withdrawer's shares are gone, so their part of the
        // interest is 0 and nobody's figure carries them.
        expect(at(withdrawer.history, 123)).toBe(0);
        expect(
            at(holder.history, 123) / Number('211.807088222242248242'),
        ).toBeCloseTo(740.176373 / Number('232846.694674864406100479'), 12);
    });

    it('without a recorded clearing start, pairs by the epoch tag as before', async () => {
        const state = offClearingWithdrawalState('holder');
        state.clearings = { [POOL_C]: { 121: 1791345715, 122: 1791946585 } };
        const { history } = await bothReads(state);
        expect(history.find((e) => e.epochId === 123)?.netYield).toBeCloseTo(
            (740.176373 * Number('211.807088222242248242')) /
                Number('306598.81009980747452684'),
            10,
        );
    });

    it('a lock whose shares were zeroed books no negative yield, in the history AND the last-epoch figures', async () => {
        const { history, lending } = await bothReads(zeroedLockState());
        const base =
            (4339.402805 * Number('431.000250505106433893')) /
            Number('1653014.919696082472702442');
        // 79: the lender's shares arrived AT clearing 79, after its interest.
        // 80: the base interest only — never −431 shares × today's price.
        // 81 onwards: no shares, no entry.
        expect(history.map((e) => e.epochId)).toEqual([80]);
        expect(history[0]?.netYield).toBeCloseTo(base, 10);
        for (const e of history) expect(e.netYield).toBeGreaterThan(0);

        const tranche = only(lending).tranches[0];
        expect(
            parseFloat(only(lending).totalYieldEarningsLastEpoch),
        ).toBeCloseTo(base, 10);
        expect(
            parseFloat(tranche.fixedLoans[0].yieldEarnings.lastEpoch),
        ).toBeCloseTo(base, 10);
    });

    it('shares received from another wallet book no negative yield', async () => {
        const { history, lending } = await bothReads(
            movedSharesState('received'),
        );
        expect(history).toEqual([]);
        expect(only(lending).totalYieldEarningsLastEpoch).toBe('0');
    });
});

describe('getPortfolioLendingData — balances the chain backs', () => {
    it('a wallet that received shares never shows a negative balance', async () => {
        const { portfolio, poolOverviews, activeAssetReads } = harness(
            movedSharesState('received'),
        );
        const lending = await portfolio.getPortfolioLendingData(
            USER,
            poolOverviews,
            '103',
        );
        // The ledger says −37 411.05; the chain says 0.
        expect(only(lending).tranches[0].investedAmount).toBe('0.0');
        expect(activeAssetReads).toHaveBeenCalledTimes(1);
        expect(activeAssetReads).toHaveBeenCalledWith(
            USER,
            [TRANCHE_C1],
            undefined,
        );
    });

    it('a wallet that sent its shares away shows what the chain holds, not the ledger', async () => {
        const { portfolio, poolOverviews } = harness(movedSharesState('sent'));
        const lending = await portfolio.getPortfolioLendingData(
            USER,
            poolOverviews,
            '103',
        );
        expect(only(lending).tranches[0].investedAmount).toBe('0.0');
    });

    it('takes the chain balance, and moves the ledger yield with it, when the two disagree', async () => {
        const state = movedSharesState('received');
        state.tranches[0].activeAssets = '1250.5';
        const { portfolio, poolOverviews } = harness(state);
        const lending = await portfolio.getPortfolioLendingData(
            USER,
            poolOverviews,
            '103',
        );
        const tranche = only(lending).tranches[0];
        expect(tranche.investedAmount).toBe('1250.5');
        // The ledger's 10 moves by the same difference as the balance.
        expect(parseFloat(tranche.yieldEarnings.lifetime)).toBeCloseTo(
            10 + 1250.5 - Number('-37411.053085795351083519'),
            6,
        );
    });

    it('costs no chain read when the ledger and the chain agree', async () => {
        const { portfolio, poolOverviews, activeAssetReads } =
            harness(baseState());
        await portfolio.getPortfolioLendingData(
            USER,
            poolOverviews,
            String(CURRENT_EPOCH),
        );
        expect(activeAssetReads).not.toHaveBeenCalled();
    });
});

describe('sharesAtInterest / trancheSharesAtInterest', () => {
    const tranche = offClearingWithdrawalState('holder').tranches[0];
    const snapshots = rows(TRANCHE_C1, tranche.trancheUpdates);
    const withdrawal = {
        epochId: '123',
        createdOn: '1792116301',
        sharesAmount: '73752.115424943068426361',
    };

    it('takes the withdrawal accepted between clearings off the snapshot', () => {
        expect(
            trancheSharesAtInterest(snapshots, [withdrawal], 123, 1792648817),
        ).toBeCloseTo(Number('232846.694674864406100479'), 9);
    });

    it('leaves out a withdrawal the clearing itself accepted (at or after its start)', () => {
        expect(
            trancheSharesAtInterest(
                snapshots,
                [{ ...withdrawal, createdOn: '1792648817' }],
                123,
                1792648817,
            ),
        ).toBeCloseTo(Number('306598.81009980747452684'), 9);
    });

    it('leaves out a withdrawal of another epoch', () => {
        expect(
            trancheSharesAtInterest(
                snapshots,
                [{ ...withdrawal, epochId: '122' }],
                123,
                1792648817,
            ),
        ).toBeCloseTo(Number('306598.81009980747452684'), 9);
    });

    it('a lender update tagged after the epoch but written before its clearing is in force', () => {
        const updates = rows('w', [
            { epochId: 97, shares: '73752.1', timestamp: 1776037813 },
            { epochId: 124, shares: '0', timestamp: 1792116301 },
        ]);
        expect(sharesAtInterest(updates, 123, 1792648817)?.shares).toBe('0');
        // By the tag alone it would still be the 73 752.1.
        expect(sharesAtInterest(updates, 123, undefined)?.shares).toBe(
            '73752.1',
        );
    });

    it('an update written AT the clearing (its own acceptances) is not', () => {
        const updates = rows('d', [
            { epochId: 118, shares: '211.8', timestamp: 1789018541 },
            { epochId: 124, shares: '370.7', timestamp: 1792648817 },
        ]);
        expect(sharesAtInterest(updates, 123, 1792648817)?.shares).toBe(
            '211.8',
        );
    });
});
