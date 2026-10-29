import { BigNumber } from 'ethers';
import { formatUnits, Interface } from 'ethers/lib/utils';
import { gql } from 'graphql-request';

import { KasuPoolExternalTVLAbi__factory } from '../../contracts';
import { poolTvl, PoolTvlHistoryEntry } from '../../domain/pool-tvl';

/**
 * Which part of a pool's TVL history to return, and how long to wait for it.
 * Epochs are counted in the chain's numbering
 * (`SystemVariables.currentEpochNumber`), and the newest epoch is the
 * CURRENT one, which the closing `current` point carries.
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
    /**
     * The whole call's time limit, in MILLISECONDS. On expiry it rejects with
     * `PoolTvlHistoryTimeoutError` and starts no further request.
     * @default 30_000
     */
    timeoutMs?: number;
    /**
     * Abandons the call: it rejects with `PoolTvlHistoryAbortedError` and
     * starts no further request. Already aborted = rejected before any read.
     */
    signal?: AbortSignal;
}

/**
 * `getPoolTvlHistoryWindow`'s answer: the same entries `getPoolTvlHistory`
 * returns, and whether the window may have cut older history off. Pass it to
 * `combineTvlHistories` as a leg (`{ ...result, usdRate }`).
 */
export interface PoolTvlHistoryResult {
    entries: PoolTvlHistoryEntry[];
    /**
     * `true` when the pool may have cleared BEFORE the first point — the
     * series starts where the window does, not where the pool did. `false`
     * only when the read proves there is nothing older. See
     * `isPoolTvlHistoryTruncated` for the rule per window.
     */
    truncated: boolean;
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

/** Attempts per past-state RPC read (each over every history RPC in turn). */
export const TVL_HISTORY_RPC_ATTEMPTS = 3;

/** Back-off before the second attempt; doubled for each one after. */
export const TVL_HISTORY_RPC_RETRY_DELAY_MS = 500;

/** Per-call timeout of the history providers the SDK builds itself. */
export const TVL_HISTORY_RPC_TIMEOUT_MS = 10_000;

/** Default `timeoutMs` of a whole `getPoolTvlHistory` call. */
export const TVL_HISTORY_DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Blocks at least this far below the subgraph's head are treated as final
 * and their reads are cached; nearer ones are read again every time.
 */
export const TVL_HISTORY_CACHE_DEPTH = 64;

/** Entries per SDK instance before the cache starts again from empty. */
export const TVL_HISTORY_CACHE_LIMIT = 20_000;

/** `getPoolTvlHistory` took longer than its `timeoutMs`. */
export class PoolTvlHistoryTimeoutError extends Error {
    constructor(public readonly timeoutMs: number) {
        super(`getPoolTvlHistory: timed out after ${String(timeoutMs)} ms`);
        this.name = 'PoolTvlHistoryTimeoutError';
    }
}

/** `getPoolTvlHistory` was abandoned through its `signal`. */
export class PoolTvlHistoryAbortedError extends Error {
    constructor() {
        super('getPoolTvlHistory: aborted');
        this.name = 'PoolTvlHistoryAbortedError';
    }
}

/**
 * A history provider answered a past block as if nothing were deployed — no
 * code even for the pool, which cleared in that very block. A pruned node
 * does that; trusting it would draw the off-chain TVL as 0.
 */
export class PastStateUnavailableError extends Error {
    constructor(public readonly block: number) {
        super(
            `getPoolTvlHistory: history provider does not serve past state (no code for the pool at block ${String(block)}, where it cleared)`,
        );
        this.name = 'PastStateUnavailableError';
    }
}

/**
 * Throws `RangeError` / `TypeError` on a malformed option.
 * `getPoolTvlHistory` calls it ONCE, BEFORE any network read;
 * `resolvePoolTvlHistoryWindow` assumes it has run.
 */
export function validatePoolTvlHistoryOptions(
    options: PoolTvlHistoryOptions,
): void {
    const { fromEpoch, count, timeoutMs, signal } = options;
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
    if (
        timeoutMs !== undefined &&
        (typeof timeoutMs !== 'number' ||
            !Number.isFinite(timeoutMs) ||
            timeoutMs <= 0)
    ) {
        throw new RangeError(
            `getPoolTvlHistory: timeoutMs must be a positive number, got ${String(timeoutMs)}`,
        );
    }
    if (
        signal !== undefined &&
        (typeof signal !== 'object' ||
            typeof (signal as { aborted?: unknown }).aborted !== 'boolean')
    ) {
        throw new TypeError('getPoolTvlHistory: signal must be an AbortSignal');
    }
}

/** The epoch window. Options must already have passed validation. */
export function resolvePoolTvlHistoryWindow(
    options: Pick<PoolTvlHistoryOptions, 'fromEpoch' | 'count'>,
    currentEpoch: number,
): PoolTvlHistoryWindow | null {
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
// Cancellation: one deadline and one optional signal for the whole call
// ---------------------------------------------------------------------------

/** What every stage checks before it starts more work. */
export interface Cancellation {
    /** Aborted with the call; hand it to `fetch`-based clients. */
    readonly signal: AbortSignal;
    /** Throws the typed reason once the call is timed out or aborted. */
    throwIfCancelled(): void;
}

/**
 * Runs `work` under a deadline and an optional caller signal. Whichever comes
 * first rejects the returned promise with its typed error at once, aborts
 * `cancellation.signal` (cancelling in-flight subgraph requests) and makes
 * every later `throwIfCancelled()` throw, so no new read starts. An RPC call
 * already sent cannot be recalled; its answer is dropped.
 */
export async function runCancellable<T>(
    timeoutMs: number,
    external: AbortSignal | undefined,
    work: (cancellation: Cancellation) => Promise<T>,
): Promise<T> {
    if (external?.aborted) throw new PoolTvlHistoryAbortedError();

    const controller = new AbortController();
    let reason: Error | undefined;
    let rejectCancelled: (error: Error) => void = () => undefined;
    const cancelled = new Promise<never>((_, reject) => {
        rejectCancelled = reject;
    });
    const cancel = (error: Error): void => {
        if (reason) return;
        reason = error;
        controller.abort();
        rejectCancelled(error);
    };

    const timer = setTimeout(() => {
        cancel(new PoolTvlHistoryTimeoutError(timeoutMs));
    }, timeoutMs);
    const onAbort = (): void => {
        cancel(new PoolTvlHistoryAbortedError());
    };
    external?.addEventListener('abort', onAbort);

    const cancellation: Cancellation = {
        signal: controller.signal,
        throwIfCancelled: () => {
            if (reason) throw reason;
        },
    };

    try {
        const running = work(cancellation);
        // The losing side must never surface as an unhandled rejection.
        running.catch(() => undefined);
        return await Promise.race([running, cancelled]);
    } finally {
        clearTimeout(timer);
        external?.removeEventListener('abort', onAbort);
    }
}

// ---------------------------------------------------------------------------
// Subgraph reads
// ---------------------------------------------------------------------------

/** Above any epoch number: "no upper bound" for the clearings query. */
const NO_EPOCH_BOUND = '1000000000000';

/**
 * The pool's FINISHED clearings, plus — on the first page only — its balance
 * now and the subgraph's latest block.
 *
 * Two modes over one document: ascending from `$epochGte` (a `fromEpoch`
 * window, or everything), or descending below `$epochLt` (the newest N, for
 * a `count`-only window, so it never pages through the whole history).
 */
export const poolTvlClearingsQuery = gql`
    query PoolTvlClearings(
        $poolId: ID!
        $pool: String!
        $epochGte: BigInt!
        $epochLt: BigInt!
        $direction: OrderDirection!
        $first: Int!
        $withSnapshot: Boolean!
    ) {
        clearings: lendingPoolClearings(
            first: $first
            orderBy: epochId
            orderDirection: $direction
            where: {
                lendingPool: $pool
                isFinished: true
                epochId_gte: $epochGte
                epochId_lt: $epochLt
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

export interface PoolTvlSnapshot {
    pool?: { balance: string } | null;
    meta?: { block: { number: number; timestamp: number | null } } | null;
}

export interface PoolTvlClearingsResult extends PoolTvlSnapshot {
    clearings: ClearingRow[];
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

/** One subgraph request; `signal` cancels it. */
export type GraphRequest = <T>(
    document: string,
    variables: Record<string, unknown>,
    signal?: AbortSignal,
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

/** Which clearings to read: ascending from an epoch, or the newest N. */
export type ClearingsScope =
    | { kind: 'from'; fromEpoch: number }
    | { kind: 'newest'; count: number };

/**
 * The scope's finished clearings, ascending by epoch, and the snapshot from
 * the first page. Normally ONE request.
 */
export async function fetchPoolClearings(
    request: GraphRequest,
    poolId: string,
    scope: ClearingsScope,
    cancellation: Cancellation,
): Promise<{
    clearings: Clearing[];
    snapshot: PoolTvlSnapshot;
    requests: number;
}> {
    const clearings: Clearing[] = [];
    let snapshot: PoolTvlSnapshot = {};
    let gte = scope.kind === 'from' ? scope.fromEpoch : 0;
    let lt: number | undefined;
    let requests = 0;

    for (;;) {
        cancellation.throwIfCancelled();
        if (requests >= TVL_HISTORY_MAX_PAGES) {
            throw new Error(
                `getPoolTvlHistory: more than ${String(TVL_HISTORY_MAX_PAGES)} pages of clearings for one pool`,
            );
        }
        const first = requests === 0;
        const remaining =
            scope.kind === 'newest'
                ? scope.count - clearings.length
                : TVL_HISTORY_PAGE_SIZE;
        const pageSize = Math.min(TVL_HISTORY_PAGE_SIZE, remaining);
        const page = await request<PoolTvlClearingsResult>(
            poolTvlClearingsQuery,
            {
                poolId,
                pool: poolId,
                epochGte: String(gte),
                epochLt: lt === undefined ? NO_EPOCH_BOUND : String(lt),
                direction: scope.kind === 'newest' ? 'desc' : 'asc',
                first: pageSize,
                withSnapshot: first,
            },
            cancellation.signal,
        );
        requests += 1;
        if (first) snapshot = { pool: page.pool, meta: page.meta };

        const rows = page.clearings.map(parseClearing);
        clearings.push(...rows);
        const last = rows.at(-1);
        if (rows.length < pageSize || last === undefined) break;
        if (scope.kind === 'newest') {
            if (clearings.length >= scope.count) break;
            if (lt !== undefined && last.epochId >= lt) {
                throw new Error(
                    'getPoolTvlHistory: the clearings cursor did not advance',
                );
            }
            lt = last.epochId;
        } else {
            if (last.epochId < gte) {
                throw new Error(
                    'getPoolTvlHistory: the clearings cursor did not advance',
                );
            }
            gte = last.epochId + 1;
        }
    }

    clearings.sort((a, b) => a.epochId - b.epochId);
    return { clearings, snapshot, requests };
}

/**
 * Pure: whether a read may have cut older clearings off, from what
 * `fetchPoolClearings` fetched (BEFORE the window filter) and the window.
 *
 * - `count` only (`newest`): the fetch asks for the newest `count` clearings
 *   across ALL epochs, then keeps those in the window. Truncated when one of
 *   them fell before the window (older history is certain), or when all
 *   `count` came back (the page was full, so older may exist). Not truncated
 *   only when fewer than `count` came back and none was before the window:
 *   the fetch then holds every clearing the pool has. Counting the clearings
 *   left in the window would be wrong — the current epoch has no finished
 *   clearing until it clears, so a pool that clears every epoch shows
 *   `count − 1` of them most of the week.
 * - `fromEpoch` given (`from`): the fetch reads only from `fromEpoch` on and
 *   never sees an older clearing. Truncated whenever `fromEpoch > 0` (older
 *   history MAY exist; the read did not look), so `false` only for a read of
 *   the pool's whole history.
 */
export function isPoolTvlHistoryTruncated(
    scope: ClearingsScope,
    fetched: readonly Clearing[],
    window: PoolTvlHistoryWindow,
): boolean {
    if (scope.kind === 'from') return scope.fromEpoch > 0;
    return (
        fetched.length >= scope.count ||
        fetched.some((clearing) => clearing.epochId < window.fromEpoch)
    );
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
    cancellation: Cancellation,
): Promise<{ balances: Map<number, string>; requests: number }> {
    const chunks: number[][] = [];
    for (let i = 0; i < blocks.length; i += TVL_HISTORY_BLOCKS_PER_REQUEST) {
        chunks.push(blocks.slice(i, i + TVL_HISTORY_BLOCKS_PER_REQUEST));
    }

    cancellation.throwIfCancelled();
    const pages = await Promise.all(
        chunks.map((chunk) =>
            request<PoolBalancesAtBlocksResult>(
                poolBalancesAtBlocksQuery(chunk),
                { poolId },
                cancellation.signal,
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
 * What a history provider must answer: an `eth_call` and an `eth_getCode`
 * at a block. Any ethers v5 `Provider` is one.
 */
export interface HistoryRpc {
    call(
        transaction: { to: string; data: string },
        blockTag: number | 'latest',
    ): Promise<string>;
    getCode(address: string, blockTag: number): Promise<string>;
}

/**
 * The past-state reads behind the off-chain TVL. Every method rejects on any
 * failure; none may turn an error into a value.
 */
export interface OffChainTvlReader {
    /** `externalTVLOfPool(pool)` at `block`, in the stable token's BASE units. */
    readAt(block: number | 'latest'): Promise<BigNumber>;
    /** Whether the `ExternalTVL` contract has code at `block`. */
    hasCodeAt(block: number): Promise<boolean>;
    /** Whether the POOL contract has code at `block` (the pruned-node check). */
    poolHasCodeAt(block: number): Promise<boolean>;
}

const EXTERNAL_TVL_INTERFACE: Interface = new Interface(
    KasuPoolExternalTVLAbi__factory.abi,
);

function hasCode(code: unknown): boolean {
    if (typeof code !== 'string' || !/^0x[0-9a-fA-F]*$/.test(code)) {
        throw new Error(
            `getPoolTvlHistory: getCode returned ${String(code)}, not hex`,
        );
    }
    return code !== '0x';
}

/**
 * The real reader: each read goes to the history RPCs IN ORDER until one
 * answers, and the whole chain is retried `attempts` times with back-off.
 * After the last attempt the last error propagates — never a value. Each
 * attempt first checks the cancellation, so a timed-out call stops here.
 */
export function createOffChainTvlReader({
    externalTvl,
    pool,
    rpcs,
    cancellation,
    attempts = TVL_HISTORY_RPC_ATTEMPTS,
    delayMs = TVL_HISTORY_RPC_RETRY_DELAY_MS,
    sleep = (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms)),
}: {
    externalTvl: string;
    pool: string;
    rpcs: readonly HistoryRpc[];
    cancellation: Cancellation;
    attempts?: number;
    delayMs?: number;
    sleep?: (ms: number) => Promise<void>;
}): OffChainTvlReader {
    if (rpcs.length === 0) {
        throw new Error('getPoolTvlHistory: no history RPC to read from');
    }
    const data = EXTERNAL_TVL_INTERFACE.encodeFunctionData(
        'externalTVLOfPool',
        [pool],
    );

    const read = async <T>(op: (rpc: HistoryRpc) => Promise<T>): Promise<T> => {
        let lastError: unknown;
        for (let attempt = 1; attempt <= attempts; attempt++) {
            for (const rpc of rpcs) {
                cancellation.throwIfCancelled();
                try {
                    return await op(rpc);
                } catch (error) {
                    lastError = error;
                }
            }
            if (attempt < attempts) {
                await sleep(delayMs * 2 ** (attempt - 1));
            }
        }
        cancellation.throwIfCancelled();
        throw lastError;
    };

    return {
        readAt: (block) =>
            read(async (rpc) => {
                const result = await rpc.call({ to: externalTvl, data }, block);
                const [value] = EXTERNAL_TVL_INTERFACE.decodeFunctionResult(
                    'externalTVLOfPool',
                    result,
                ) as unknown as [BigNumber];
                return value;
            }),
        hasCodeAt: (block) =>
            read(async (rpc) => hasCode(await rpc.getCode(externalTvl, block))),
        poolHasCodeAt: (block) =>
            read(async (rpc) => hasCode(await rpc.getCode(pool, block))),
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

/**
 * `fn` over `items`, at most `limit` in flight; rejects on the first failure
 * and starts nothing after it (or after `beforeEach` throws).
 */
export async function mapWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T) => Promise<R>,
    beforeEach: () => void = (): void => undefined,
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let next = 0;
    let failed = false;
    const worker = async (): Promise<void> => {
        while (!failed && next < items.length) {
            const index = next++;
            try {
                beforeEach();
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
 * Immutable past-block reads, per SDK instance. Keys carry the contract (or
 * subgraph), the pool and the block, so two deployments never collide.
 */
export class PastBlockCache {
    private readonly _entries = new Map<string, unknown>();

    get<T>(key: string): T | undefined {
        return this._entries.get(key) as T | undefined;
    }

    set(key: string, value: unknown): void {
        if (this._entries.size >= TVL_HISTORY_CACHE_LIMIT) {
            this._entries.clear();
        }
        this._entries.set(key, value);
    }

    get size(): number {
        return this._entries.size;
    }
}

/**
 * The off-chain TVL (BASE units) at each block, and — with `withLatest` — at
 * the latest block, all inside ONE bounded pool of reads.
 *
 * Before the contract existed there was nothing to record, so those blocks
 * are 0 — decided by `getCode`, never by catching a revert: an RPC that
 * refuses past state can surface that refusal as a "call exception". And a
 * "no code" answer is believed only if the same provider DOES show code for
 * the pool at the oldest and newest such block (it cleared there); otherwise
 * `PastStateUnavailableError`. Every other failed read throws.
 *
 * `cached` blocks (final, below the head) are answered from `cache` and
 * stored there after a successful read.
 */
export async function fetchOffChainTvlAtBlocks(
    reader: OffChainTvlReader,
    blocks: readonly number[],
    {
        withLatest = false,
        cancellation,
        cache,
        cacheKey,
        cacheable = (): boolean => false,
    }: {
        withLatest?: boolean;
        cancellation: Cancellation;
        cache?: PastBlockCache;
        cacheKey?: (kind: 'tvl' | 'code' | 'pool', block: number) => string;
        cacheable?: (block: number) => boolean;
    },
): Promise<{
    offChain: Map<number, BigNumber>;
    latest: BigNumber | null;
    rpcReads: number;
}> {
    let rpcReads = 0;
    const cached = <T>(
        kind: 'tvl' | 'code' | 'pool',
        block: number,
        load: () => Promise<T>,
    ): Promise<T> => {
        const key =
            cache && cacheKey && cacheable(block)
                ? cacheKey(kind, block)
                : undefined;
        const hit = key === undefined ? undefined : cache?.get<T>(key);
        if (hit !== undefined) return Promise.resolve(hit);
        cancellation.throwIfCancelled();
        rpcReads += 1;
        return load().then((value) => {
            if (key !== undefined) cache?.set(key, value);
            return value;
        });
    };

    const deployedFrom = await firstBlockWithCode(blocks, (block) =>
        cached('code', block, () => reader.hasCodeAt(block)),
    );

    if (deployedFrom > 0) {
        for (const block of new Set([blocks[0], blocks[deployedFrom - 1]])) {
            const poolDeployed = await cached('pool', block, () =>
                reader.poolHasCodeAt(block),
            );
            if (!poolDeployed) throw new PastStateUnavailableError(block);
        }
    }

    const offChain = new Map<number, BigNumber>();
    for (const block of blocks.slice(0, deployedFrom)) {
        offChain.set(block, BigNumber.from(0));
    }
    const targets: (number | 'latest')[] = [...blocks.slice(deployedFrom)];
    if (withLatest) targets.push('latest');
    const values = await mapWithConcurrency(
        targets,
        TVL_HISTORY_RPC_CONCURRENCY,
        (block) => {
            if (block !== 'latest') {
                return cached('tvl', block, () => reader.readAt(block));
            }
            // Never cached: "latest" moves.
            rpcReads += 1;
            return reader.readAt('latest');
        },
        () => {
            cancellation.throwIfCancelled();
        },
    );

    let latest: BigNumber | null = null;
    targets.forEach((block, i) => {
        if (block === 'latest') latest = values[i];
        else offChain.set(block, values[i]);
    });

    return { offChain, latest, rpcReads };
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
