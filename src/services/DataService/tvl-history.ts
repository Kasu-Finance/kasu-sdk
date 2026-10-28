import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { gql } from 'graphql-request';

import { poolTvl, PoolTvlHistoryEntry } from '../../domain/pool-tvl';

/**
 * Which part of a pool's TVL history to return. Epochs are counted in the
 * chain's numbering (`SystemVariables.currentEpochNumber`), and the newest
 * epoch is the CURRENT one, which the closing `current` point carries.
 *
 * - neither field: every clearing, then the `current` point;
 * - `count` only: the newest `count` epochs, up to and including the current
 *   one (a pool that did not clear in some of them has fewer points);
 * - `fromEpoch` only: `fromEpoch` up to the current epoch;
 * - both: `count` epochs starting at `fromEpoch`, capped at the current
 *   epoch. The `current` point is included only when the window reaches the
 *   current epoch.
 */
export interface PoolTvlHistoryOptions {
    /** First epoch included. A non-negative integer. */
    fromEpoch?: number;
    /** How many epochs. A positive integer. */
    count?: number;
}

/** The resolved, inclusive epoch range; `null` when it is empty. */
export interface PoolTvlHistoryWindow {
    fromEpoch: number;
    toEpoch: number;
}

/** Clearings per subgraph page (the subgraph's own row cap). */
export const TVL_HISTORY_PAGE_SIZE = 1000;

/**
 * A runaway guard on the clearings pagination, not a working limit: a pool
 * clears once per epoch, so 20 pages would be twenty thousand cycles.
 */
export const TVL_HISTORY_MAX_PAGES = 20;

/**
 * How many past blocks one time-travel request reads, as GraphQL aliases. A
 * pool with ~120 clearings costs two such requests.
 */
export const TVL_HISTORY_BLOCKS_PER_REQUEST = 100;

/** At most this many past-state RPC reads are in flight at once. */
export const TVL_HISTORY_RPC_CONCURRENCY = 8;

/**
 * Throws `RangeError` on a malformed `fromEpoch` / `count`.
 * `getPoolTvlHistory` calls it BEFORE any network read.
 */
export function validatePoolTvlHistoryOptions(
    options: PoolTvlHistoryOptions,
): void {
    const { fromEpoch, count } = options;
    if (
        fromEpoch !== undefined &&
        (!Number.isSafeInteger(fromEpoch) || fromEpoch < 0)
    ) {
        throw new RangeError(
            `getPoolTvlHistory: fromEpoch must be a non-negative integer, got ${String(fromEpoch)}`,
        );
    }
    if (count !== undefined && (!Number.isSafeInteger(count) || count < 1)) {
        throw new RangeError(
            `getPoolTvlHistory: count must be a positive integer, got ${String(count)}`,
        );
    }
}

export function resolvePoolTvlHistoryWindow(
    options: PoolTvlHistoryOptions,
    currentEpoch: number,
): PoolTvlHistoryWindow | null {
    validatePoolTvlHistoryOptions(options);
    const { fromEpoch, count } = options;

    let from: number;
    let to = currentEpoch;
    if (fromEpoch !== undefined) {
        from = fromEpoch;
        if (count !== undefined) {
            to = Math.min(currentEpoch, fromEpoch + count - 1);
        }
    } else {
        from = count !== undefined ? Math.max(0, currentEpoch - count + 1) : 0;
    }

    return from > to ? null : { fromEpoch: from, toEpoch: to };
}

// ---------------------------------------------------------------------------
// Subgraph reads
// ---------------------------------------------------------------------------

/**
 * Round trip 1 (and, for a pool with more than a thousand clearings, the
 * next pages): the pool's FINISHED clearings in epoch order, plus — on the
 * first page only — its balance now and the subgraph's latest block.
 *
 * `$fromEpoch` is the pagination cursor (the last epoch read + 1) and starts
 * at the window's lower bound, which is known before the current epoch is.
 */
export const poolTvlClearingsQuery = gql`
    query PoolTvlClearings(
        $poolId: ID!
        $pool: String!
        $fromEpoch: BigInt!
        $first: Int!
        $withSnapshot: Boolean!
    ) {
        clearings: lendingPoolClearings(
            first: $first
            orderBy: epochId
            orderDirection: asc
            where: {
                lendingPool: $pool
                isFinished: true
                epochId_gte: $fromEpoch
            }
        ) {
            epochId
            endBlockNumber
            endTimestamp
        }
        pool: lendingPool(id: $poolId) @include(if: $withSnapshot) {
            balance
        }
        meta: _meta @include(if: $withSnapshot) {
            block {
                number
                timestamp
            }
        }
    }
`;

export interface ClearingRow {
    epochId: string;
    endBlockNumber: string;
    endTimestamp: string;
}

export interface PoolTvlClearingsResult {
    clearings: ClearingRow[];
    pool?: { balance: string } | null;
    meta?: { block: { number: number; timestamp: number | null } } | null;
}

/** The time-travel alias for one block: `b<block>`. */
export function blockAlias(block: number): string {
    return `b${String(block)}`;
}

/**
 * One time-travel request: the pool's balance at the END of each block, one
 * alias per block. Block numbers are written into the document, so each must
 * be a positive safe integer — anything else throws rather than reaching the
 * query text. The pool id travels as a variable.
 */
export function poolBalancesAtBlocksQuery(blocks: readonly number[]): string {
    const fields = blocks.map((block) => {
        if (!Number.isSafeInteger(block) || block <= 0) {
            throw new Error(
                `getPoolTvlHistory: refusing block number ${String(block)}`,
            );
        }
        return `${blockAlias(block)}: lendingPool(id: $poolId, block: { number: ${String(block)} }) { balance }`;
    });
    return `query PoolTvlAtBlocks($poolId: ID!) { ${fields.join(' ')} }`;
}

export type PoolBalancesAtBlocksResult = Record<
    string,
    { balance: string } | null
>;

type GraphRequest = <T>(
    document: string,
    variables: Record<string, unknown>,
) => Promise<T>;

/** A clearing row parsed and checked. */
export interface Clearing {
    epochId: number;
    block: number;
    timestamp: number;
}

function parseClearing(row: ClearingRow): Clearing {
    const clearing = {
        epochId: Number(row.epochId),
        block: Number(row.endBlockNumber),
        timestamp: Number(row.endTimestamp),
    };
    if (
        !Number.isSafeInteger(clearing.epochId) ||
        clearing.epochId < 0 ||
        !Number.isSafeInteger(clearing.block) ||
        clearing.block <= 0 ||
        !Number.isSafeInteger(clearing.timestamp) ||
        clearing.timestamp <= 0
    ) {
        throw new Error(
            `getPoolTvlHistory: malformed clearing row ${JSON.stringify(row)}`,
        );
    }
    return clearing;
}

/**
 * Every finished clearing from `fromEpoch` on, and the snapshot from the first
 * page. Normally ONE request.
 */
export async function fetchPoolClearings(
    request: GraphRequest,
    poolId: string,
    fromEpoch: number,
): Promise<{
    clearings: Clearing[];
    snapshot: Pick<PoolTvlClearingsResult, 'pool' | 'meta'>;
    requests: number;
}> {
    const clearings: Clearing[] = [];
    let snapshot: Pick<PoolTvlClearingsResult, 'pool' | 'meta'> = {};
    let cursor = fromEpoch;
    let requests = 0;

    for (;;) {
        if (requests >= TVL_HISTORY_MAX_PAGES) {
            throw new Error(
                `getPoolTvlHistory: more than ${String(TVL_HISTORY_MAX_PAGES)} pages of clearings for one pool`,
            );
        }
        const first = requests === 0;
        const page = await request<PoolTvlClearingsResult>(
            poolTvlClearingsQuery,
            {
                poolId,
                pool: poolId,
                fromEpoch: String(cursor),
                first: TVL_HISTORY_PAGE_SIZE,
                withSnapshot: first,
            },
        );
        requests += 1;
        if (first) snapshot = { pool: page.pool, meta: page.meta };

        const rows = page.clearings.map(parseClearing);
        clearings.push(...rows);
        const last = rows.at(-1);
        if (rows.length < TVL_HISTORY_PAGE_SIZE || last === undefined) break;
        if (last.epochId < cursor) {
            throw new Error(
                'getPoolTvlHistory: the clearings cursor did not advance',
            );
        }
        cursor = last.epochId + 1;
    }

    return { clearings, snapshot, requests };
}

/**
 * The pool's balance (display units, the subgraph's decimal string) at the end
 * of each block, `TVL_HISTORY_BLOCKS_PER_REQUEST` blocks per request. A block
 * at which the subgraph has no such pool THROWS: a finished clearing of the
 * pool happened in it, so a missing pool means a broken read, not a zero.
 */
export async function fetchPoolBalancesAtBlocks(
    request: GraphRequest,
    poolId: string,
    blocks: readonly number[],
): Promise<{ balances: Map<number, string>; requests: number }> {
    const chunks: number[][] = [];
    for (let i = 0; i < blocks.length; i += TVL_HISTORY_BLOCKS_PER_REQUEST) {
        chunks.push(blocks.slice(i, i + TVL_HISTORY_BLOCKS_PER_REQUEST));
    }

    const pages = await Promise.all(
        chunks.map((chunk) =>
            request<PoolBalancesAtBlocksResult>(
                poolBalancesAtBlocksQuery(chunk),
                { poolId },
            ).then((page) => ({ chunk, page })),
        ),
    );

    const balances = new Map<number, string>();
    for (const { chunk, page } of pages) {
        for (const block of chunk) {
            const state = page[blockAlias(block)];
            if (!state) {
                throw new Error(
                    `getPoolTvlHistory: the subgraph has no state for the pool at block ${String(block)}`,
                );
            }
            balances.set(block, state.balance);
        }
    }
    return { balances, requests: chunks.length };
}

// ---------------------------------------------------------------------------
// Off-chain TVL at past blocks
// ---------------------------------------------------------------------------

/**
 * The past-state reads of the pool's `ExternalTVL` contract, bound to a
 * provider that SERVES past state. Both reject on any failure; neither may
 * turn an error into a value.
 */
export interface OffChainTvlReader {
    /** `externalTVLOfPool(pool)` at `block`, in the stable token's BASE units. */
    readAt(block: number | 'latest'): Promise<BigNumber>;
    /** Whether the `ExternalTVL` contract has code at `block`. */
    hasCodeAt(block: number): Promise<boolean>;
}

/** Attempts per past-state RPC read before the history throws. */
export const TVL_HISTORY_RPC_ATTEMPTS = 3;

/** Back-off before the second attempt; doubled for each one after. */
export const TVL_HISTORY_RPC_RETRY_DELAY_MS = 500;

/**
 * `reader` with every read retried — public RPCs shed load with transient
 * errors, and ethers v5 reports some of them as a "call exception". A retry
 * changes nothing about the outcome rule: after the last attempt the error
 * propagates, it never becomes a value.
 */
export function retryingReader(
    reader: OffChainTvlReader,
    {
        attempts = TVL_HISTORY_RPC_ATTEMPTS,
        delayMs = TVL_HISTORY_RPC_RETRY_DELAY_MS,
        sleep = (ms: number): Promise<void> =>
            new Promise((resolve) => setTimeout(resolve, ms)),
    }: {
        attempts?: number;
        delayMs?: number;
        sleep?: (ms: number) => Promise<void>;
    } = {},
): OffChainTvlReader {
    const retry = async <T>(read: () => Promise<T>): Promise<T> => {
        for (let attempt = 1; ; attempt++) {
            try {
                return await read();
            } catch (error) {
                if (attempt >= attempts) throw error;
                await sleep(delayMs * 2 ** (attempt - 1));
            }
        }
    };
    return {
        readAt: (block) => retry(() => reader.readAt(block)),
        hasCodeAt: (block) => retry(() => reader.hasCodeAt(block)),
    };
}

/**
 * Index of the first block (of `blocks`, ascending) at which the contract has
 * code; `blocks.length` when it has code at none. A deployed contract keeps
 * its code (it is a proxy, never self-destructed), so the answer is a single
 * boundary and a binary search finds it: ONE `getCode` when the contract
 * already existed at the oldest clearing, about log2(n) otherwise.
 */
export async function firstBlockWithCode(
    blocks: readonly number[],
    hasCodeAt: (block: number) => Promise<boolean>,
): Promise<number> {
    if (blocks.length === 0) return 0;
    if (await hasCodeAt(blocks[0])) return 0;
    const last = blocks.length - 1;
    if (!(await hasCodeAt(blocks[last]))) return blocks.length;
    let lo = 0; // no code
    let hi = last; // code
    while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        if (await hasCodeAt(blocks[mid])) hi = mid;
        else lo = mid;
    }
    return hi;
}

/** `fn` over `items`, at most `limit` in flight; rejects on the first failure. */
export async function mapWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T) => Promise<R>,
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let next = 0;
    let failed = false;
    const worker = async (): Promise<void> => {
        while (!failed && next < items.length) {
            const index = next++;
            try {
                results[index] = await fn(items[index]);
            } catch (error) {
                failed = true;
                throw error;
            }
        }
    };
    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, worker),
    );
    return results;
}

/**
 * The off-chain TVL (BASE units) at each block, and — with `withLatest` — at
 * the latest block, all inside ONE bounded pool of reads. Before the contract
 * existed there was nothing to record, so those blocks are 0 — decided by
 * `getCode`, never by catching a revert: an RPC that refuses past state can
 * surface that refusal as a "call exception", and reading it as 0 would draw
 * a confident, wrong chart. Every other read must succeed or the whole
 * history throws.
 */
export async function fetchOffChainTvlAtBlocks(
    reader: OffChainTvlReader,
    blocks: readonly number[],
    { withLatest = false }: { withLatest?: boolean } = {},
): Promise<{
    offChain: Map<number, BigNumber>;
    latest: BigNumber | null;
    rpcReads: number;
}> {
    let codeReads = 0;
    const deployedFrom = await firstBlockWithCode(blocks, (block) => {
        codeReads += 1;
        return reader.hasCodeAt(block);
    });

    const offChain = new Map<number, BigNumber>();
    for (const block of blocks.slice(0, deployedFrom)) {
        offChain.set(block, BigNumber.from(0));
    }
    const targets: (number | 'latest')[] = [...blocks.slice(deployedFrom)];
    if (withLatest) targets.push('latest');
    const values = await mapWithConcurrency(
        targets,
        TVL_HISTORY_RPC_CONCURRENCY,
        (block) => reader.readAt(block),
    );

    let latest: BigNumber | null = null;
    targets.forEach((block, i) => {
        if (block === 'latest') latest = values[i];
        else offChain.set(block, values[i]);
    });

    return { offChain, latest, rpcReads: targets.length + codeReads };
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export interface PoolTvlHistoryRead {
    /** Finished clearings inside the window. */
    clearings: Clearing[];
    /** On-chain balance (display units) at each distinct clearing block. */
    balances: ReadonlyMap<number, string>;
    /** Off-chain TVL (BASE units) at each distinct clearing block. */
    offChain: ReadonlyMap<number, BigNumber>;
    /** The closing point's inputs; `null` when the window stops short of now. */
    current: {
        epochId: number;
        timestamp: number;
        balance: string;
        offChain: BigNumber;
    } | null;
    /** The stable token's decimals, for the off-chain BASE units. */
    decimals: number;
}

/**
 * Pure: the reads → the history. One `clearing` point per clearing, ordered by
 * the block it finished in (then by epoch, for clearings that shared a block),
 * so the series is ascending in TIME even where epoch numbers jump; then the
 * `current` point. Each point is `poolTvl(onChain, offChain)` — the same
 * function `getPoolOverview` uses for `totalValueLocked.total`.
 */
export function buildPoolTvlHistory(
    read: PoolTvlHistoryRead,
): PoolTvlHistoryEntry[] {
    const offChainDisplay = (value: BigNumber): string =>
        formatUnits(value, read.decimals);

    const entries: PoolTvlHistoryEntry[] = [...read.clearings]
        .sort((a, b) => a.block - b.block || a.epochId - b.epochId)
        .map((clearing) => {
            const balance = read.balances.get(clearing.block);
            const offChain = read.offChain.get(clearing.block);
            if (balance === undefined || offChain === undefined) {
                throw new Error(
                    `getPoolTvlHistory: no reading at block ${String(clearing.block)}`,
                );
            }
            return {
                epochId: clearing.epochId,
                timestamp: clearing.timestamp,
                tvl: poolTvl(balance, offChainDisplay(offChain)),
                kind: 'clearing' as const,
            };
        });

    if (read.current) {
        entries.push({
            epochId: read.current.epochId,
            timestamp: read.current.timestamp,
            tvl: poolTvl(
                read.current.balance,
                offChainDisplay(read.current.offChain),
            ),
            kind: 'current',
        });
    }
    return entries;
}

/** Ascending, de-duplicated clearing blocks: each past block is read ONCE. */
export function distinctBlocks(clearings: readonly Clearing[]): number[] {
    return [...new Set(clearings.map((c) => c.block))].sort((a, b) => a - b);
}
