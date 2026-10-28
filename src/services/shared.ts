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
