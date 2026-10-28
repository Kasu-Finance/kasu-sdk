/**
 * A pool's TVL — the total lent into it by everyone — and the shape of its
 * history. Pure: the reads live in `services/DataService/tvl-history.ts`.
 */

/**
 * The ONE definition of a pool's TVL: what lenders have lent on chain
 * (`lendingPool.balance` in the subgraph) plus the off-chain amount the
 * pool's `ExternalTVL` contract records (`externalTVLOfPool`).
 *
 * Both inputs, and the result, are in DISPLAY units of the deployment's own
 * stable token (USDC on Base and XDC USDC, AUDD on XDC AUDD) — `'1.5'` is
 * one and a half tokens, not 1.5 minor units. Convert before formatting as
 * USD.
 *
 * `getPoolOverview` (its `totalValueLocked.total`) and `getPoolTvlHistory`
 * (every point) both call this, so the chart and the figure above it cannot
 * be computed two ways.
 */
export function poolTvl(onChainBalance: string, offChainTvl: string): number {
    return parseFloat(onChainBalance) + parseFloat(offChainTvl);
}

/**
 * One point of a pool's TVL history.
 *
 * - `kind: 'clearing'` — the TVL as it stood at the end of the block in which
 *   that epoch's clearing finished (`LendingPoolClearing.endBlockNumber`):
 *   accepted deposits and withdrawals and the applied interest included.
 * - `kind: 'current'` — the closing "as of now" point, from two sources: the
 *   subgraph's latest balance (and its latest block time) and
 *   `externalTVLOfPool` at `latest` on the history provider. It equals
 *   today's `PoolOverview.totalValueLocked.total` when both that call's reads
 *   and these succeed; `getPoolOverview` falls back to an off-chain 0 when its
 *   own read fails, and the figure can move between the two calls.
 */
export interface PoolTvlHistoryEntry {
    /**
     * The epoch (cycle) number, in the chain's numbering
     * (`SystemVariables.currentEpochNumber`).
     *
     * A clearing point carries the epoch that clearing closed. The `current`
     * point carries the CURRENT epoch — which may equal the newest clearing's
     * epoch, because a clearing runs before its epoch rolls over. Epoch
     * numbers can jump (a pool that did not clear for a while, or a
     * deployment whose first clearing is numbered far below the next one), so
     * plot by `timestamp`, never by `epochId`.
     */
    epochId: number;
    /**
     * Unix SECONDS. A clearing point: the time of the block its clearing
     * finished in (`endTimestamp`). The `current` point: the time of the
     * subgraph's latest indexed block. Clearings that finished in the same
     * block (a pool catching up several epochs at once) share a timestamp and
     * a `tvl`.
     */
    timestamp: number;
    /**
     * TVL in DISPLAY units of the deployment's own stable token (USDC on Base
     * and XDC USDC, AUDD on XDC AUDD): `poolTvl(onChain, offChain)` at that
     * block. Convert before formatting as USD.
     */
    tvl: number;
    /** `'clearing'` for a cycle boundary; `'current'` for the closing point. */
    kind: 'clearing' | 'current';
}
