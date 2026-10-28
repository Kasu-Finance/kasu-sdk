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
 * Round trip 2 onwards: the four per-epoch series, one page of each per
 * request, cursor-paginated by `id`. A series that is exhausted is skipped with
 * `@include`, so a history costs as many requests as its LONGEST series has
 * pages — normally one — never one per epoch.
 *
 * Share snapshots are read up to the window's end with no lower bound: the
 * value AS OF the first epoch may come from an update long before it.
 */
export const yieldHistoryPageQuery = gql`
    query YieldHistoryPage(
        $tranches: [String!]!
        $userTranches: [String!]!
        $locks: [String!]!
        $fromEpoch: BigInt!
        $toEpoch: BigInt!
        $interestCursor: ID!
        $trancheSharesCursor: ID!
        $userSharesCursor: ID!
        $lockSharesCursor: ID!
        $withInterest: Boolean!
        $withTrancheShares: Boolean!
        $withUserShares: Boolean!
        $withLockShares: Boolean!
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
                epochId_lte: $toEpoch
            }
        ) @include(if: $withUserShares) {
            id
            epochId
            shareUpdatesIndex
            shares
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

export interface InterestRow {
    id: string;
    epochId: string;
    epochInterestAmount: string;
    lendingPoolTranche: { id: string };
}

export interface YieldHistoryPageResult {
    interest?: InterestRow[];
    trancheShares?: (ShareUpdateRow & { lendingPoolTranche: { id: string } })[];
    userShares?: (ShareUpdateRow & {
        lendingPoolTrancheUserDetails: { id: string };
    })[];
    lockShares?: (ShareUpdateRow & {
        userLendingPoolTrancheFixedTermDepositLock: { id: string };
    })[];
}

/** Everything `buildYieldHistory` reads, keyed by the subgraph's entity ids. */
export interface YieldHistoryRead {
    positions: YieldHistoryPositionsResult;
    interest: InterestRow[];
    trancheShares: (ShareUpdateRow & { lendingPoolTranche: { id: string } })[];
    userShares: (ShareUpdateRow & {
        lendingPoolTrancheUserDetails: { id: string };
    })[];
    lockShares: (ShareUpdateRow & {
        userLendingPoolTrancheFixedTermDepositLock: { id: string };
    })[];
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
 * Fetch the four series for the window, paginating each by `id` until a short
 * page. Returns the rows and how many requests it took.
 */
export async function fetchYieldHistorySeries(
    request: PageRequest,
    ids: { tranches: string[]; userTranches: string[]; locks: string[] },
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
    ] as const;

    const cursors: Record<(typeof series)[number]['key'], string> = {
        interest: '',
        trancheShares: '',
        userShares: '',
        lockShares: '',
    };
    const open: Record<(typeof series)[number]['key'], boolean> = {
        interest: ids.tranches.length > 0,
        trancheShares: ids.tranches.length > 0,
        userShares: ids.userTranches.length > 0,
        lockShares: ids.locks.length > 0,
    };

    let requests = 0;
    while (series.some(({ key }) => open[key])) {
        if (requests >= YIELD_HISTORY_MAX_PAGES) {
            throw new Error(
                `getYieldHistory: more than ${String(YIELD_HISTORY_MAX_PAGES)} pages for one lender`,
            );
        }

        const variables: Record<string, unknown> = {
            tranches: ids.tranches,
            userTranches: ids.userTranches,
            locks: ids.locks,
            fromEpoch: String(window.fromEpoch),
            toEpoch: String(window.toEpoch),
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
export function sharesAsOf(
    updates: readonly ShareUpdateRow[],
    epoch: number,
): ShareUpdateRow | undefined {
    let found: ShareUpdateRow | undefined;
    for (const update of updates) {
        if (Number(update.epochId) > epoch) continue;
        if (!found || update.shareUpdatesIndex > found.shareUpdatesIndex) {
            found = update;
        }
    }
    return found;
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
 * share selection, so the newest entry equals that figure.
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

    const entries: YieldHistoryEntry[] = [];

    for (const pool of user.lendingPoolUserDetails) {
        for (const position of pool.lendingPoolTrancheUserDetails) {
            const trancheId = position.tranche.id;
            const trancheUpdates = trancheSharesByTranche.get(trancheId) ?? [];
            const userUpdates = userSharesByPosition.get(position.id) ?? [];
            const trancheBalanceNow = parseFloat(position.tranche.balance);
            const trancheSharesNow = parseFloat(position.tranche.shares);

            for (const record of interestByTranche.get(trancheId) ?? []) {
                const epoch = Number(record.epochId);
                if (epoch < window.fromEpoch || epoch > window.toEpoch) {
                    continue;
                }

                const userSnapshot = sharesAsOf(userUpdates, epoch);
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
                    trancheShares: parseFloat(
                        sharesAsOf(trancheUpdates, epoch)?.shares ?? '0',
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
