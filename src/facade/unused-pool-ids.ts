/** Directus instance holding Kasu's pool editorial content. */
const DEFAULT_DIRECTUS_URL = 'https://kasu-finance.directus.app/';

interface PoolOverviewIdRow {
    id?: unknown;
}

interface PoolOverviewIdResponse {
    data?: PoolOverviewIdRow[];
}

/**
 * The pool ids that are configured but NOT enabled — the ones every query
 * should exclude.
 *
 * "Enabled" is editorial state, held in Directus rather than on-chain: a pool
 * exists in the subgraph from the moment it is deployed, and stays hidden
 * until content has been written for it. Every consumer has been hard-coding
 * this list; reading it means a pool goes live without a frontend release.
 *
 * ```ts
 * const kasu = Kasu.create({
 *     chain: 'base',
 *     configOverrides: { UNUSED_LENDING_POOL_IDS: await fetchUnusedPoolIds() },
 * });
 * ```
 *
 * May legitimately return an empty array (every pool enabled). Pass it
 * straight through: `SdkConfig` normalises an empty list to the `['']`
 * sentinel, because the subgraph reads `id_not_in: []` as "match nothing" and
 * would hide every pool.
 *
 * Uses the global `fetch`, so it needs Node 18+ or a browser. This is I/O and
 * deliberately not part of `domain/`.
 *
 * @param directusUrl base URL of the Directus instance, with or without a
 *   trailing slash.
 * @throws when the request fails or Directus answers with a non-2xx status —
 *   never silently returns `[]`, which would be indistinguishable from "every
 *   pool is enabled" and would un-hide pools that have no content.
 */
export async function fetchUnusedPoolIds(
    directusUrl: string = DEFAULT_DIRECTUS_URL,
): Promise<string[]> {
    const base = directusUrl.endsWith('/') ? directusUrl : `${directusUrl}/`;
    const url = `${base}items/PoolOverview?filter[enabled][_neq]=true`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `fetchUnusedPoolIds: Directus responded ${String(response.status)} ${response.statusText} for ${url}`,
        );
    }

    const body = (await response.json()) as PoolOverviewIdResponse;
    return (body.data ?? [])
        .map((row) => row.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
}
