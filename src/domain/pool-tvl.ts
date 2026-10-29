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

/**
 * One deployment's share of a strategy's history, for `combineTvlHistories`:
 * that pool's `getPoolTvlHistoryWindow` result (`{ entries, opening }`) as it
 * came back, and what one unit of the deployment's stable token is worth in
 * USD (`1` for USDC; today's AUD→USD for AUDD). The SDK fetches no exchange
 * rate: the caller passes it.
 */
export interface TvlHistoryLeg {
    /** At least one point: a real pool always returns its `current` point. */
    entries: readonly PoolTvlHistoryEntry[];
    /** USD per unit of the leg's stable token. Finite and above 0. */
    usdRate: number;
    /**
     * The leg's value BEFORE its first entry: the newest clearing before the
     * window, as `getPoolTvlHistoryWindow` read it at its own block. A
     * `'clearing'` point no later than the first entry; it is never drawn.
     * `null` or absent: the pool has no clearing before the window (it
     * started lending later, say) and counts 0 before its first entry.
     */
    opening?: PoolTvlHistoryEntry | null;
}

/**
 * One point of a strategy's TVL summed across its deployments.
 *
 * There is no `epochId`: each chain clears at its own blocks and times, so a
 * merged point belongs to no single epoch. Plot by `timestamp`.
 */
export interface StrategyTvlHistoryEntry {
    /** Unix SECONDS. Strictly ascending across the series. */
    timestamp: number;
    /** The sum over legs of each leg's TVL then, times its `usdRate`. */
    tvlUsd: number;
    /** `'clearing'` for a cycle boundary on any leg; `'current'` for the closing point. */
    kind: 'clearing' | 'current';
}

/**
 * What `combineTvlHistories` refuses, as a code:
 *
 * - `legs` — not a non-empty array (or one with holes);
 * - `leg` — a leg that is not an object;
 * - `usd-rate` — a rate that is not a finite number above 0;
 * - `opening` — an opening that is not a well-formed `'clearing'` point at
 *   or before the leg's first entry (or `null`, or absent);
 * - `entries` — a leg's `entries` is not an array;
 * - `empty-leg` — a leg with no entries: pass only the legs you have;
 * - `entry` — an entry that is not an object (or a hole);
 * - `timestamp` / `tvl` — not a finite number at or above 0;
 * - `kind` — neither `'clearing'` nor `'current'`;
 * - `order` — timestamps going backwards within a leg;
 * - `current` — a `current` point that is not the leg's last, or some legs
 *   ending in one and others not;
 * - `overflow` — a sum too large to be a finite number.
 */
export type TvlHistoryInputErrorCode =
    | 'legs'
    | 'leg'
    | 'usd-rate'
    | 'opening'
    | 'entries'
    | 'empty-leg'
    | 'entry'
    | 'timestamp'
    | 'tvl'
    | 'kind'
    | 'order'
    | 'current'
    | 'overflow';

/**
 * What `combineTvlHistories` throws instead of returning a number it cannot
 * stand behind. `leg` and `entry` are the zero-based position of the
 * offending input, when there is one.
 */
export class TvlHistoryInputError extends Error {
    readonly code: TvlHistoryInputErrorCode;
    readonly leg: number | undefined;
    readonly entry: number | undefined;

    constructor(code: TvlHistoryInputErrorCode, leg?: number, entry?: number) {
        const at = [
            leg === undefined ? '' : ` at leg ${String(leg)}`,
            entry === undefined ? '' : `, entry ${String(entry)}`,
        ].join('');
        super(`combineTvlHistories: input refused (${code})${at}`);
        this.name = 'TvlHistoryInputError';
        this.code = code;
        this.leg = leg;
        this.entry = entry;
        Object.setPrototypeOf(this, TvlHistoryInputError.prototype);
    }
}

function isNonNegativeFinite(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Throws unless the leg is well formed. Index loops, not `forEach`: a hole in
 * a sparse array is skipped by the array methods and would surface later as
 * a raw `TypeError` instead of a refusal.
 */
function validateLeg(leg: unknown, legIndex: number): TvlHistoryLeg {
    if (typeof leg !== 'object' || leg === null) {
        throw new TvlHistoryInputError('leg', legIndex);
    }
    const { entries, usdRate, opening } = leg as Partial<TvlHistoryLeg>;
    if (
        typeof usdRate !== 'number' ||
        !Number.isFinite(usdRate) ||
        usdRate <= 0
    ) {
        throw new TvlHistoryInputError('usd-rate', legIndex);
    }
    if (!Array.isArray(entries as unknown)) {
        throw new TvlHistoryInputError('entries', legIndex);
    }
    const list = entries as readonly unknown[];
    if (list.length === 0) {
        throw new TvlHistoryInputError('empty-leg', legIndex);
    }
    let previous = -Infinity;
    for (let index = 0; index < list.length; index += 1) {
        const entry = list[index];
        if (typeof entry !== 'object' || entry === null) {
            throw new TvlHistoryInputError('entry', legIndex, index);
        }
        const { timestamp, tvl, kind } = entry as Partial<PoolTvlHistoryEntry>;
        if (!isNonNegativeFinite(timestamp)) {
            throw new TvlHistoryInputError('timestamp', legIndex, index);
        }
        if (!isNonNegativeFinite(tvl)) {
            throw new TvlHistoryInputError('tvl', legIndex, index);
        }
        if (kind !== 'clearing' && kind !== 'current') {
            throw new TvlHistoryInputError('kind', legIndex, index);
        }
        if (kind === 'current' && index !== list.length - 1) {
            throw new TvlHistoryInputError('current', legIndex, index);
        }
        if (timestamp < previous) {
            throw new TvlHistoryInputError('order', legIndex, index);
        }
        previous = timestamp;
    }
    if (opening !== undefined && opening !== null) {
        const first = list[0] as PoolTvlHistoryEntry;
        const { timestamp, tvl, kind } = (
            typeof opening === 'object' ? opening : {}
        ) as Partial<PoolTvlHistoryEntry>;
        if (
            !isNonNegativeFinite(timestamp) ||
            !isNonNegativeFinite(tvl) ||
            kind !== 'clearing' ||
            timestamp > first.timestamp
        ) {
            throw new TvlHistoryInputError('opening', legIndex);
        }
    }
    return leg as TvlHistoryLeg;
}

/**
 * A strategy's TVL in USD over time, from its deployments' histories — Tax
 * Pay runs on Base (USDC) and on XDC (AUDD), and its total lent is both.
 * Pure: the caller fetches each leg (`strategyDeployments` names them) and
 * passes the exchange rates.
 *
 * A step merge by time. At every distinct timestamp where any leg has a
 * clearing, the value is the sum over legs of that leg's latest point at or
 * before then, times its `usdRate`. Before its first entry a leg counts its
 * `opening` — what it held just before the window — or 0 without one.
 * Points that share a timestamp — clearings run in one block, or two chains
 * clearing in the same second — are one output point. The series ends with
 * one `current` point at the latest of the legs' `current` timestamps, equal
 * to the sum of their `current` values. Every leg must end in a `current`
 * point, or none may.
 *
 * The window is the union of the legs' windows: the series starts at the
 * earliest first entry of any leg. An `opening` is a value, never a point.
 * Without it, two windows cut at offset clearing times would count the
 * later-starting leg 0 at the left edge and draw a false step up; with it,
 * only a genuine late start (`opening: null`) counts 0.
 *
 * Every leg and entry is validated first: a bad input — an empty leg
 * included — throws `TvlHistoryInputError` (its `code` says why), so the
 * result never holds `NaN` or `Infinity`. The inputs are not modified.
 *
 * ```ts
 * const window = { count: 52 };
 * const points = combineTvlHistories([
 *     { ...(await base.strategies.getPoolTvlHistoryWindow(basePool, window)), usdRate: 1 },
 *     { ...(await xdc.strategies.getPoolTvlHistoryWindow(xdcPool, window)), usdRate: audToUsd },
 * ]);
 * ```
 */
export function combineTvlHistories(
    legs: readonly TvlHistoryLeg[],
): StrategyTvlHistoryEntry[] {
    if (!Array.isArray(legs as unknown) || legs.length === 0) {
        throw new TvlHistoryInputError('legs');
    }
    const valid: TvlHistoryLeg[] = [];
    for (let index = 0; index < legs.length; index += 1) {
        valid.push(validateLeg(legs[index], index));
    }
    const endsInCurrent = valid.map(
        (leg) => leg.entries[leg.entries.length - 1].kind === 'current',
    );
    const odd = endsInCurrent.findIndex((ends) => ends !== endsInCurrent[0]);
    if (odd !== -1) throw new TvlHistoryInputError('current', odd);

    const finalTimestamp = endsInCurrent[0]
        ? Math.max(
              ...valid.map(
                  (leg) => leg.entries[leg.entries.length - 1].timestamp,
              ),
          )
        : undefined;
    const clearingTimes = [
        ...new Set(
            valid.flatMap((leg) =>
                leg.entries
                    .filter((entry) => entry.kind === 'clearing')
                    .map((entry) => entry.timestamp),
            ),
        ),
    ]
        .filter((t) => finalTimestamp === undefined || t < finalTimestamp)
        .sort((a, b) => a - b);

    // One cursor per leg: the times ascend, so each leg is walked once. A
    // leg's `current` point is a step like any other, which keeps a chain
    // whose subgraph lags behind the other's last clearing at its own latest.
    const cursors = valid.map(() => -1);
    const sumAt = (t: number): number => {
        let sum = 0;
        valid.forEach((leg, index) => {
            let cursor = cursors[index];
            while (
                cursor + 1 < leg.entries.length &&
                leg.entries[cursor + 1].timestamp <= t
            ) {
                cursor += 1;
            }
            cursors[index] = cursor;
            const value =
                cursor >= 0 ? leg.entries[cursor].tvl : (leg.opening?.tvl ?? 0);
            sum += value * leg.usdRate;
        });
        if (!Number.isFinite(sum)) throw new TvlHistoryInputError('overflow');
        return sum;
    };

    const combined: StrategyTvlHistoryEntry[] = clearingTimes.map((t) => ({
        timestamp: t,
        tvlUsd: sumAt(t),
        kind: 'clearing' as const,
    }));
    if (finalTimestamp !== undefined) {
        combined.push({
            timestamp: finalTimestamp,
            tvlUsd: sumAt(finalTimestamp),
            kind: 'current',
        });
    }
    return combined;
}
