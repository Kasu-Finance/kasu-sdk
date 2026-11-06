import { gql } from 'graphql-request';

import {
    EpochLockShares,
    epochTrancheYield,
    YieldHistoryEntry,
} from '../../domain/yield-history';

/**
 * Which settled epochs a history covers. Epochs are counted in the chain's
 * numbering (`SystemVariables.currentEpochNumber`). Only SETTLED epochs exist
 * in a history — the newest is `currentEpoch − 1`.
 *
 * - neither field: every settled epoch;
 * - `count` only: the newest `count` settled epochs;
 * - `fromEpoch` only: `fromEpoch` up to the newest settled epoch;
 * - both: `count` epochs starting at `fromEpoch`, capped at the newest settled.
 */
export interface YieldHistoryOptions {
    /** First epoch included. A non-negative integer. */
    fromEpoch?: number;
    /** How many epochs. A positive integer. */
    count?: number;
}

/** The resolved, inclusive epoch range; `null` when it holds no settled epoch. */
export interface YieldHistoryWindow {
    fromEpoch: number;
    toEpoch: number;
}

/** The subgraph returns at most this many rows per collection per request. */
export const YIELD_HISTORY_PAGE_SIZE = 1000;

/**
 * A runaway guard, not a working limit: a collection this many pages long
 * (`MAX × PAGE_SIZE` rows for one lender) is a broken response, not a history.
 */
export const YIELD_HISTORY_MAX_PAGES = 100;

/**
 * Throws `RangeError` on a malformed `fromEpoch` / `count`. `getYieldHistory`
 * calls it BEFORE any network read.
 */
export function validateYieldHistoryOptions(
    options: YieldHistoryOptions,
): void {
    const { fromEpoch, count } = options;
    if (
        fromEpoch !== undefined &&
        (!Number.isSafeInteger(fromEpoch) || fromEpoch < 0)
    ) {
        throw new RangeError(
            `getYieldHistory: fromEpoch must be a non-negative integer, got ${String(fromEpoch)}`,
        );
    }
    if (count !== undefined && (!Number.isSafeInteger(count) || count < 1)) {
        throw new RangeError(
            `getYieldHistory: count must be a positive integer, got ${String(count)}`,
        );
    }
}

export function resolveYieldHistoryWindow(
    options: YieldHistoryOptions,
    currentEpoch: number,
): YieldHistoryWindow | null {
    validateYieldHistoryOptions(options);
    const { fromEpoch, count } = options;

    const newest = currentEpoch - 1;
    if (newest < 0) return null;

    let from: number;
    let to = newest;
    if (fromEpoch !== undefined) {
        from = fromEpoch;
        if (count !== undefined) to = Math.min(newest, fromEpoch + count - 1);
    } else {
        from = count !== undefined ? Math.max(0, newest - count + 1) : 0;
    }

    return from > to ? null : { fromEpoch: from, toEpoch: to };
}

// ---------------------------------------------------------------------------
// Subgraph reads
// ---------------------------------------------------------------------------

/**
 * Round trip 1: the lender's tranche positions and fixed-term locks. Same
 * pool exclusion and the same nested-list size (`$first`) as
 * `lendingPortfolioQuery`, so both read the same lock set.
 */
export const yieldHistoryPositionsQuery = gql`
    query YieldHistoryPositions(
        $userAddress: ID!
        $unusedPools: [String!]!
        $first: Int!
    ) {
        user(id: $userAddress) {
            lendingPoolUserDetails(
                first: $first
                where: { lendingPool_not_in: $unusedPools }
            ) {
                lendingPool {
                    id
                }
                lendingPoolTrancheUserDetails(first: $first) {
                    id
                    tranche {
                        id
                        balance
                        shares
                    }
                    userLendingPoolTrancheFixedTermDepositLocks(first: $first) {
                        id
                        epochLockStart
                        epochLockEnd
                        initialTrancheShares
                    }
                }
            }
        }
    }
`;

/**
 * Round trip 2 onwards: the six per-epoch series, one page of each per
 * request, cursor-paginated by `id`. A series that is exhausted is skipped with
 * `@include`, so a history costs as many requests as its LONGEST series has
 * pages — normally one — never one per epoch.
 *
 * Share snapshots are read up to the window's end with no lower bound: the
 * value AS OF the first epoch may come from an update long before it. Each
 * carries its `timestamp`, and the window's clearings their start, because a
 * cycle's interest is paired with the shares in force when the clearing
 * APPLIED it (`sharesAtInterest`), which the epoch tag alone gets wrong for a
 * withdrawal accepted between clearings — so the lender's updates are read one
 * tag past the window (`$userSharesToEpoch`), where the subgraph puts it.
 * Those withdrawals are read too: the subgraph writes no tranche snapshot for
 * them (`trancheSharesAtInterest`).
 */
export const yieldHistoryPageQuery = gql`
    query YieldHistoryPage(
        $pools: [String!]!
        $tranches: [String!]!
        $userTranches: [String!]!
        $locks: [String!]!
        $fromEpoch: BigInt!
        $toEpoch: BigInt!
        $userSharesToEpoch: BigInt!
        $interestCursor: ID!
        $trancheSharesCursor: ID!
        $userSharesCursor: ID!
        $lockSharesCursor: ID!
        $clearingsCursor: ID!
        $withdrawalsCursor: ID!
        $withInterest: Boolean!
        $withTrancheShares: Boolean!
        $withUserShares: Boolean!
        $withLockShares: Boolean!
        $withClearings: Boolean!
        $withWithdrawals: Boolean!
        $first: Int!
    ) {
        interest: lendingPoolTrancheEpochInterests(
            first: $first
            orderBy: id
            orderDirection: asc
            where: {
                id_gt: $interestCursor
                lendingPoolTranche_in: $tranches
                epochId_gte: $fromEpoch
                epochId_lte: $toEpoch
            }
        ) @include(if: $withInterest) {
            id
            epochId
            epochInterestAmount
            lendingPoolTranche {
                id
            }
        }
        trancheShares: lendingPoolTrancheShareUpdates(
            first: $first
            orderBy: id
            orderDirection: asc
            where: {
                id_gt: $trancheSharesCursor
                lendingPoolTranche_in: $tranches
                epochId_lte: $toEpoch
            }
        ) @include(if: $withTrancheShares) {
            id
            epochId
            shareUpdatesIndex
            shares
            timestamp
            lendingPoolTranche {
                id
            }
        }
        userShares: lendingPoolTrancheUserEpochSharesUpdates(
            first: $first
            orderBy: id
            orderDirection: asc
            where: {
                id_gt: $userSharesCursor
                lendingPoolTrancheUserDetails_in: $userTranches
                epochId_lte: $userSharesToEpoch
            }
        ) @include(if: $withUserShares) {
            id
            epochId
            shareUpdatesIndex
            shares
            timestamp
            lendingPoolTrancheUserDetails {
                id
            }
        }
        lockShares: userLendingPoolTrancheFtdLockShareUpdates(
            first: $first
            orderBy: id
            orderDirection: asc
            where: {
                id_gt: $lockSharesCursor
                userLendingPoolTrancheFixedTermDepositLock_in: $locks
                epochId_lte: $toEpoch
            }
        ) @include(if: $withLockShares) {
            id
            epochId
            shareUpdatesIndex
            shares
            userLendingPoolTrancheFixedTermDepositLock {
                id
            }
        }
        clearings: lendingPoolClearings(
            first: $first
            orderBy: id
            orderDirection: asc
            where: {
                id_gt: $clearingsCursor
                lendingPool_in: $pools
                epochId_gte: $fromEpoch
                epochId_lte: $toEpoch
            }
        ) @include(if: $withClearings) {
            id
            epochId
            startTimestamp
            lendingPool {
                id
            }
        }
        withdrawals: userRequestEvents(
            first: $first
            orderBy: id
            orderDirection: asc
            where: {
                id_gt: $withdrawalsCursor
                type: WithdrawalAccepted
                tranche_in: $tranches
                epochId_gte: $fromEpoch
                epochId_lte: $toEpoch
            }
        ) @include(if: $withWithdrawals) {
            id
            epochId
            createdOn
            sharesAmount
            tranche {
                id
            }
        }
    }
`;

export interface YieldHistoryPositionsResult {
    user: {
        lendingPoolUserDetails: {
            lendingPool: { id: string };
            lendingPoolTrancheUserDetails: {
                id: string;
                tranche: { id: string; balance: string; shares: string };
                userLendingPoolTrancheFixedTermDepositLocks: {
                    id: string;
                    epochLockStart: string;
                    epochLockEnd: string;
                    initialTrancheShares: string;
                }[];
            }[];
        }[];
    } | null;
}

/** One share snapshot: the value from `epochId` on, until the next one. */
export interface ShareUpdateRow {
    id: string;
    epochId: string;
    shareUpdatesIndex: number;
    shares: string;
}

/** A tranche or lender share snapshot, with the block time it was written at. */
export interface TimedShareUpdateRow extends ShareUpdateRow {
    /** Unix seconds. */
    timestamp: string;
}

/** What the share selection reads from a snapshot — no entity id needed. */
export type TimedShareSnapshot = Pick<
    TimedShareUpdateRow,
    'epochId' | 'shareUpdatesIndex' | 'shares' | 'timestamp'
>;

export interface InterestRow {
    id: string;
    epochId: string;
    epochInterestAmount: string;
    lendingPoolTranche: { id: string };
}

/** A pool's clearing for one epoch: its first transaction applied the interest. */
export interface ClearingRow {
    id: string;
    epochId: string;
    /** Unix seconds of the clearing's first transaction. */
    startTimestamp: string;
    lendingPool: { id: string };
}

/** One accepted withdrawal (any lender) in a tranche. */
export interface WithdrawalAcceptedRow {
    id: string;
    /** The pool's clearing epoch when it was accepted (`epochClearingId`). */
    epochId: string;
    /** Unix seconds. */
    createdOn: string;
    sharesAmount: string | null;
    tranche: { id: string };
}

export interface YieldHistoryPageResult {
    interest?: InterestRow[];
    trancheShares?: (TimedShareUpdateRow & {
        lendingPoolTranche: { id: string };
    })[];
    userShares?: (TimedShareUpdateRow & {
        lendingPoolTrancheUserDetails: { id: string };
    })[];
    lockShares?: (ShareUpdateRow & {
        userLendingPoolTrancheFixedTermDepositLock: { id: string };
    })[];
    clearings?: ClearingRow[];
    withdrawals?: WithdrawalAcceptedRow[];
}

/** Everything `buildYieldHistory` reads, keyed by the subgraph's entity ids. */
export interface YieldHistoryRead {
    positions: YieldHistoryPositionsResult;
    interest: InterestRow[];
    trancheShares: (TimedShareUpdateRow & {
        lendingPoolTranche: { id: string };
    })[];
    userShares: (TimedShareUpdateRow & {
        lendingPoolTrancheUserDetails: { id: string };
    })[];
    lockShares: (ShareUpdateRow & {
        userLendingPoolTrancheFixedTermDepositLock: { id: string };
    })[];
    clearings: ClearingRow[];
    withdrawals: WithdrawalAcceptedRow[];
}

/** The chain's epoch clock: epoch E ends at `epochZeroStart + (E + 1) × duration`. */
export interface EpochClock {
    epochZeroStart: number;
    epochDuration: number;
}

type PageRequest = (
    variables: Record<string, unknown>,
) => Promise<YieldHistoryPageResult>;

/**
 * Fetch the six series for the window, paginating each by `id` until a short
 * page. Returns the rows and how many requests it took.
 */
export async function fetchYieldHistorySeries(
    request: PageRequest,
    ids: {
        pools: string[];
        tranches: string[];
        userTranches: string[];
        locks: string[];
    },
    window: YieldHistoryWindow,
): Promise<{
    rows: Omit<YieldHistoryRead, 'positions'>;
    requests: number;
}> {
    const rows: Omit<YieldHistoryRead, 'positions'> = {
        interest: [],
        trancheShares: [],
        userShares: [],
        lockShares: [],
        clearings: [],
        withdrawals: [],
    };
    const series = [
        { key: 'interest', flag: 'withInterest', cursor: 'interestCursor' },
        {
            key: 'trancheShares',
            flag: 'withTrancheShares',
            cursor: 'trancheSharesCursor',
        },
        {
            key: 'userShares',
            flag: 'withUserShares',
            cursor: 'userSharesCursor',
        },
        {
            key: 'lockShares',
            flag: 'withLockShares',
            cursor: 'lockSharesCursor',
        },
        {
            key: 'clearings',
            flag: 'withClearings',
            cursor: 'clearingsCursor',
        },
        {
            key: 'withdrawals',
            flag: 'withWithdrawals',
            cursor: 'withdrawalsCursor',
        },
    ] as const;

    const cursors: Record<(typeof series)[number]['key'], string> = {
        interest: '',
        trancheShares: '',
        userShares: '',
        lockShares: '',
        clearings: '',
        withdrawals: '',
    };
    const open: Record<(typeof series)[number]['key'], boolean> = {
        interest: ids.tranches.length > 0,
        trancheShares: ids.tranches.length > 0,
        userShares: ids.userTranches.length > 0,
        lockShares: ids.locks.length > 0,
        clearings: ids.pools.length > 0,
        withdrawals: ids.tranches.length > 0,
    };

    let requests = 0;
    while (series.some(({ key }) => open[key])) {
        if (requests >= YIELD_HISTORY_MAX_PAGES) {
            throw new Error(
                `getYieldHistory: more than ${String(YIELD_HISTORY_MAX_PAGES)} pages for one lender`,
            );
        }

        const variables: Record<string, unknown> = {
            pools: ids.pools,
            tranches: ids.tranches,
            userTranches: ids.userTranches,
            locks: ids.locks,
            fromEpoch: String(window.fromEpoch),
            toEpoch: String(window.toEpoch),
            // One tag further for the lender: a withdrawal accepted between
            // clearings is tagged with the epoch AFTER the one it counts in.
            userSharesToEpoch: String(window.toEpoch + 1),
            first: YIELD_HISTORY_PAGE_SIZE,
        };
        for (const { key, flag, cursor } of series) {
            variables[flag] = open[key];
            variables[cursor] = cursors[key];
        }

        const page = await request(variables);
        requests += 1;

        for (const { key } of series) {
            if (!open[key]) continue;
            const got = page[key] ?? [];
            (rows[key] as { id: string }[]).push(...got);
            const last = got.at(-1);
            if (got.length < YIELD_HISTORY_PAGE_SIZE || last === undefined) {
                open[key] = false;
                continue;
            }
            if (last.id <= cursors[key]) {
                throw new Error(
                    `getYieldHistory: the ${key} cursor did not advance`,
                );
            }
            cursors[key] = last.id;
        }
    }

    return { rows, requests };
}

/**
 * The snapshot in force at `epoch`: among updates with `epochId ≤ epoch`, the
 * one with the highest `shareUpdatesIndex` — exactly what
 * `lendingPortfolioQuery` selects with `orderBy: shareUpdatesIndex, desc,
 * first: 1, where: { epochId_lt: epoch + 1 }`. `undefined` when none.
 */
export function sharesAsOf<
    T extends Pick<ShareUpdateRow, 'epochId' | 'shareUpdatesIndex' | 'shares'>,
>(updates: readonly T[], epoch: number): T | undefined {
    let found: T | undefined;
    for (const update of updates) {
        if (Number(update.epochId) > epoch) continue;
        if (!found || update.shareUpdatesIndex > found.shareUpdatesIndex) {
            found = update;
        }
    }
    return found;
}

/**
 * The snapshot in force when the clearing of `epoch` APPLIED that epoch's
 * interest — the shares the interest was actually spread over.
 *
 * A clearing applies interest FIRST (`ClearingCoordinator.doClearing`: the
 * `applyInterests` call before steps 1–5), then accepts deposits and
 * withdrawals. So an update is in force for epoch E's interest when it is
 * tagged `≤ E` (the subgraph tags every update written during clearing E, or
 * after it, `E + 1` or later), OR when it was written before clearing E began
 * (`timestamp < clearingStart`). The second test is the one that matters: a
 * withdrawal the pool manager accepts BETWEEN clearings
 * (`forceAcceptWithdrawalRequest`) is tagged `E + 1` by the subgraph, as if a
 * clearing had accepted it, yet the shares were gone before clearing E.
 *
 * Without a clearing start (none recorded) it is `sharesAsOf` — the tag alone.
 */
export function sharesAtInterest<T extends TimedShareSnapshot>(
    updates: readonly T[],
    epoch: number,
    clearingStart: number | undefined,
): T | undefined {
    let found: T | undefined;
    for (const update of updates) {
        const inForce =
            Number(update.epochId) <= epoch ||
            (clearingStart !== undefined &&
                Number(update.timestamp) < clearingStart);
        if (!inForce) continue;
        if (!found || update.shareUpdatesIndex > found.shareUpdatesIndex) {
            found = update;
        }
    }
    return found;
}

/**
 * The tranche's total shares when the clearing of `epoch` applied its
 * interest: the snapshot in force (`sharesAtInterest`) LESS every withdrawal
 * accepted between clearings after it and before the clearing began. The
 * subgraph writes a tranche snapshot at the end of each clearing and at an
 * immediate withdrawal, but none when a withdrawal is accepted between
 * clearings, so without this the interest is spread over shares that had
 * already left, and every holder's figure is low by the withdrawn fraction.
 *
 * Such a withdrawal is tagged with the clearing epoch it waited for (`epoch`),
 * like the ones clearing `epoch` itself accepts — those come at or after its
 * start, so the time test keeps them out. One in the snapshot's own second
 * counts as after it: the snapshot is the previous clearing's end, and the
 * manager can accept a withdrawal in the same block once that clearing ended
 * (the previous clearing's own acceptances carry the previous epoch). Without
 * a clearing start it is the snapshot alone.
 */
export function trancheSharesAtInterest(
    snapshots: readonly TimedShareSnapshot[],
    withdrawals: readonly Pick<
        WithdrawalAcceptedRow,
        'epochId' | 'createdOn' | 'sharesAmount'
    >[],
    epoch: number,
    clearingStart: number | undefined,
): number {
    const snapshot = sharesAtInterest(snapshots, epoch, clearingStart);
    let shares = parseFloat(snapshot?.shares ?? '0');
    if (clearingStart === undefined) return shares;

    const after = snapshot ? Number(snapshot.timestamp) : -Infinity;
    for (const withdrawal of withdrawals) {
        const at = Number(withdrawal.createdOn);
        if (
            Number(withdrawal.epochId) === epoch &&
            at >= after &&
            at < clearingStart
        ) {
            shares -= parseFloat(withdrawal.sharesAmount ?? '0');
        }
    }
    return shares;
}

/** `pool → epoch → clearing start`, from the clearing rows. */
export function clearingStarts(
    clearings: readonly ClearingRow[],
): Map<string, Map<number, number>> {
    const starts = new Map<string, Map<number, number>>();
    for (const clearing of clearings) {
        const start = Number(clearing.startTimestamp);
        // A clearing not yet started carries 0: no start to pair by.
        if (!(start > 0)) continue;
        const pool = clearing.lendingPool.id.toLowerCase();
        const byEpoch = starts.get(pool) ?? new Map<number, number>();
        byEpoch.set(Number(clearing.epochId), start);
        starts.set(pool, byEpoch);
    }
    return starts;
}

function groupBy<T>(
    rows: readonly T[],
    key: (row: T) => string,
): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const row of rows) {
        const k = key(row);
        const list = map.get(k);
        if (list) list.push(row);
        else map.set(k, [row]);
    }
    return map;
}

/**
 * Pure: the fetched series → one entry per pool, tranche and settled epoch in
 * which the lender held shares (or a lock earned a top-up). Each entry runs the
 * same `epochTrancheYield` as the portfolio's last-epoch figure, with the same
 * share selection (`sharesAtInterest`, `trancheSharesAtInterest`), so the
 * newest entry equals that figure.
 *
 * Sorted by `epochId`, then `poolId`, then `trancheId`.
 */
export function buildYieldHistory(
    read: YieldHistoryRead,
    window: YieldHistoryWindow,
    clock: EpochClock,
): YieldHistoryEntry[] {
    const user = read.positions.user;
    if (!user) return [];

    const interestByTranche = groupBy(
        read.interest,
        (row) => row.lendingPoolTranche.id,
    );
    const trancheSharesByTranche = groupBy(
        read.trancheShares,
        (row) => row.lendingPoolTranche.id,
    );
    const userSharesByPosition = groupBy(
        read.userShares,
        (row) => row.lendingPoolTrancheUserDetails.id,
    );
    const lockSharesByLock = groupBy(
        read.lockShares,
        (row) => row.userLendingPoolTrancheFixedTermDepositLock.id,
    );
    const withdrawalsByTranche = groupBy(
        read.withdrawals,
        (row) => row.tranche.id,
    );
    const starts = clearingStarts(read.clearings);

    const entries: YieldHistoryEntry[] = [];

    for (const pool of user.lendingPoolUserDetails) {
        const poolStarts = starts.get(pool.lendingPool.id.toLowerCase());
        for (const position of pool.lendingPoolTrancheUserDetails) {
            const trancheId = position.tranche.id;
            const trancheUpdates = trancheSharesByTranche.get(trancheId) ?? [];
            const userUpdates = userSharesByPosition.get(position.id) ?? [];
            const trancheWithdrawals =
                withdrawalsByTranche.get(trancheId) ?? [];
            const trancheBalanceNow = parseFloat(position.tranche.balance);
            const trancheSharesNow = parseFloat(position.tranche.shares);

            for (const record of interestByTranche.get(trancheId) ?? []) {
                const epoch = Number(record.epochId);
                if (epoch < window.fromEpoch || epoch > window.toEpoch) {
                    continue;
                }
                const clearingStart = poolStarts?.get(epoch);

                const userSnapshot = sharesAtInterest(
                    userUpdates,
                    epoch,
                    clearingStart,
                );
                const userShares = parseFloat(userSnapshot?.shares ?? '0');

                const locks: EpochLockShares[] =
                    position.userLendingPoolTrancheFixedTermDepositLocks.map(
                        (lock) => {
                            const lockUpdates =
                                lockSharesByLock.get(lock.id) ?? [];
                            return {
                                active:
                                    parseFloat(lock.epochLockStart) < epoch &&
                                    parseFloat(lock.epochLockEnd) >= epoch &&
                                    userSnapshot !== undefined,
                                // No snapshot yet = the lock's opening
                                // shares: a lock made after clearing E
                                // starts at E but its first update is
                                // tagged E + 1, and reading that gap as 0
                                // would book its principal as a top-up.
                                sharesAtEpoch: parseFloat(
                                    sharesAsOf(lockUpdates, epoch)?.shares ??
                                        lock.initialTrancheShares,
                                ),
                                sharesBeforeEpoch: parseFloat(
                                    sharesAsOf(lockUpdates, epoch - 1)
                                        ?.shares ?? lock.initialTrancheShares,
                                ),
                            };
                        },
                    );

                const { total } = epochTrancheYield({
                    epochInterest: parseFloat(record.epochInterestAmount),
                    userShares,
                    trancheShares: trancheSharesAtInterest(
                        trancheUpdates,
                        trancheWithdrawals,
                        epoch,
                        clearingStart,
                    ),
                    trancheBalanceNow,
                    trancheSharesNow,
                    locks,
                });

                // Nothing held and nothing topped up: not part of this
                // lender's history (a new lender's history is empty).
                if (userShares <= 0 && total === 0) continue;

                entries.push({
                    epochId: epoch,
                    epochEnd:
                        clock.epochZeroStart +
                        (epoch + 1) * clock.epochDuration,
                    poolId: pool.lendingPool.id,
                    trancheId,
                    netYield: total,
                });
            }
        }
    }

    return entries.sort(
        (a, b) =>
            a.epochId - b.epochId ||
            a.poolId.localeCompare(b.poolId) ||
            a.trancheId.localeCompare(b.trancheId),
    );
}

// Shared with `getPoolTvlHistory`: one Lite-vs-full rule for every history.
export { isEmptyHistoryError, isMissingEntityError } from '../shared';
