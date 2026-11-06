export function filterArray<T>(array: T[], id_in?: string[]): T[] {
    if(!id_in){
        return array;
    }
    else{
        return array.filter(data => {
            const { id } = data as { id: string };
            return id_in.includes(id);
        });
    }
}

/**
 * A GraphQL VALIDATION error naming an entity, field or argument this
 * deployment's subgraph does not have. A network error, a timeout or an
 * indexing error is not one.
 */
export function isMissingEntityError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const response = (error as { response?: { errors?: unknown } }).response;
    const errors = response?.errors;
    if (!Array.isArray(errors) || errors.length === 0) return false;
    return errors.every((e: unknown) => {
        const message = (e as { message?: unknown } | null)?.message;
        return (
            typeof message === 'string' &&
            /has no field|cannot query field|unknown (type|field|argument)|no such (type|field)/i.test(
                message,
            )
        );
    });
}

/**
 * The only failure a history read (`getYieldHistory`, `getPoolTvlHistory`)
 * turns into `[]`: a missing-schema error
 * on a LITE deployment, whose subgraph may predate the entities. On a full
 * deployment the entities are part of the schema, so the same error means a
 * broken query or subgraph and THROWS — an empty chart there would hide it.
 * Everything else (network, timeout, indexing) throws on every deployment, so
 * a consumer can tell "no history here" from "history unavailable".
 */
export function isEmptyHistoryError(
    error: unknown,
    liteDeployment: boolean,
): boolean {
    return liteDeployment && isMissingEntityError(error);
}

/**
 * What node implementations and RPC providers answer when they cannot serve
 * state at a requested block: pruned history, or a block they have not seen
 * yet. Matched on the error's text, lowercased.
 */
const BLOCK_UNAVAILABLE_PATTERNS = [
    'missing trie node',
    'header not found',
    'unknown block',
    'block not found',
    'pruned',
    'historical state',
    'state is not available',
    'state not available',
    'missing state',
    'state unavailable',
    'state histories',
    'block number out of range',
    'beyond current head',
    'is in the future',
] as const;

function errorTexts(error: unknown, depth = 0): string[] {
    if (depth > 4 || error === null || error === undefined) return [];
    if (typeof error === 'string') return [error];
    if (typeof error !== 'object') return [];
    const record = error as Record<string, unknown>;
    return [
        'message',
        'reason',
        'body',
        'error',
        'data',
        'serverError',
    ].flatMap((key) => errorTexts(record[key], depth + 1));
}

/**
 * True when a failed RPC read says the node cannot serve state at the block
 * asked for (pruned, or not reached yet) — and ONLY then. A rate limit, a
 * timeout, a refused connection or a revert is not this, and must surface as
 * the error it is.
 */
export function isBlockUnavailableError(error: unknown): boolean {
    const text = errorTexts(error).join(' ').toLowerCase();
    return BLOCK_UNAVAILABLE_PATTERNS.some((pattern) => text.includes(pattern));
}
