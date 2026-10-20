import { selectVisiblePools } from '../domain/pools';
import { DataService } from '../services/DataService/data-service';
import {
    PoolDelegateProfileAndHistory,
    PoolOverview,
} from '../services/DataService/types';
import { UserLending } from '../services/UserLending/user-lending';

import {
    DepositLimits,
    FixedTermOption,
    PlatformStats,
    Strategy,
    StrategyRiskPerformance,
    StrategyTranche,
} from './types';

/**
 * High-level facade for browsing Kasu lending strategies (pools).
 *
 * Handles epoch fetching internally so callers never need to know about epochs.
 */
export class StrategiesFacade {
    constructor(
        private _dataService: DataService,
        private _userLending: UserLending,
        /**
         * Chain pool id → the pool id its CMS record is keyed by (XDC pools
         * share their Base counterpart's editorial record). Lowercase keys.
         */
        private _poolMetadataMapping: Record<string, string> = {},
    ) {}

    /**
     * The pool's loss rate and first-loss capital, from its CMS
     * risk-management record. `null` when the pool has no record.
     *
     * Each figure is a NUMBER or `null` — never a guess. The CMS returns
     * "numeric" fields as a number, a numeric string, an empty string or
     * null, and an empty string must not become a confident `0`: anything that
     * is not a finite number reads as `null` (render "—"). `poolLossRate` is a
     * 0..1 fraction.
     *
     * Requires `directusUrl`; without it the call rejects with
     * `NO_DIRECTUS_URL_MESSAGE`, like every CMS-only read.
     */
    async getRiskPerformance(
        poolId: string,
    ): Promise<StrategyRiskPerformance | null> {
        const metadataId = this._metadataIdOf(poolId);
        const records = await this._dataService.getRiskManagement();
        const record = records.find(
            (r) => String(r.poolIdFK).toLowerCase() === metadataId,
        );
        if (!record) return null;
        const performance = record.riskPerformance as
            | Partial<Record<'poolLossRate' | 'firstLossCapital', unknown>>
            | null
            | undefined;
        return {
            poolLossRate: finiteOrNull(performance?.poolLossRate),
            firstLossCapital: finiteOrNull(performance?.firstLossCapital),
        };
    }

    /**
     * The credit originator's profile and lending history for a pool — the
     * CMS record whose `otherKASUPools` lists it. `null` when none does.
     *
     * Matched on the chain pool id, then on its metadata id, case-
     * insensitively. The record is returned as the service maps it; its
     * numeric fields are CMS-authored, so read them defensively.
     *
     * The service filters `otherKASUPools` through the CURRENT chain's
     * subgraph with the CMS record's (Base-keyed) ids, so on an XDC
     * deployment every profile lists no pools and this resolves `null` —
     * the same answer kasu-ui's own lookup gives there today. The metadata
     * candidate becomes live once the service resolves the mapping.
     */
    async getOriginator(
        poolId: string,
    ): Promise<PoolDelegateProfileAndHistory | null> {
        const candidates = new Set([
            poolId.toLowerCase(),
            this._metadataIdOf(poolId),
        ]);
        const profiles =
            await this._dataService.getPoolDelegateProfileAndHistory();
        return (
            profiles.find((profile) =>
                profile.otherKASUPools.some((pool) =>
                    candidates.has(String(pool.id).toLowerCase()),
                ),
            ) ?? null
        );
    }

    private _metadataIdOf(poolId: string): string {
        const lower = poolId.toLowerCase();
        return (this._poolMetadataMapping[lower] ?? lower).toLowerCase();
    }

    /**
     * Fetch all active lending strategies.
     *
     * ```ts
     * const strategies = await kasu.strategies.getAll();
     * ```
     */
    async getAll(poolIds?: string[]): Promise<Strategy[]> {
        const epochId = await this._userLending.getCurrentEpoch();
        const pools = await this._dataService.getPoolOverview(epochId, poolIds);
        return pools.map((pool) => this.mapPoolToStrategy(pool));
    }

    /**
     * The strategies a lender should actually see: active, not oversubscribed,
     * with the ones that still have capacity first and the highest max APY
     * next. `getAll` returns everything the subgraph knows about, including
     * pools that are wound down.
     *
     * The filter runs on the raw `PoolOverview[]` BEFORE mapping, so `_raw` on
     * every returned `Strategy` is the untouched pool object.
     */
    async getVisible(poolIds?: string[]): Promise<Strategy[]> {
        const epochId = await this._userLending.getCurrentEpoch();
        const pools = await this._dataService.getPoolOverview(epochId, poolIds);
        return selectVisiblePools(pools).map((pool) =>
            this.mapPoolToStrategy(pool),
        );
    }

    /**
     * The chain's performance fee.
     *
     * ⚠️ A PERCENTAGE IN 0..100 (`10` means ten percent), NOT a fraction —
     * feed it to `netEffectiveApy` as-is. Treating it as `0.10` computes a
     * nonsense negative rate that still renders as a plausible-looking
     * percentage, which is why the units are stated here and in
     * `netEffectiveApy`'s own JSDoc.
     *
     * ```ts
     * const feePercent = await kasu.strategies.getPerformanceFeePercent();
     * const net = netEffectiveApy(strategy.tranches[0].apy, feePercent);
     * ```
     */
    async getPerformanceFeePercent(): Promise<number> {
        return await this._dataService.getPerformanceFee();
    }

    /**
     * Fetch a single strategy by pool ID. Returns `null` if not found.
     */
    async getById(poolId: string): Promise<Strategy | null> {
        const results = await this.getAll([poolId]);
        return results[0] ?? null;
    }

    /**
     * Aggregate platform statistics (TVL, loans, yield, loss rate).
     */
    async getPlatformStats(): Promise<PlatformStats> {
        const epochId = await this._userLending.getCurrentEpoch();
        const pools = await this._dataService.getPoolOverview(epochId);
        return await this._dataService.getLendingTotals(pools);
    }

    /**
     * Calculate deposit limits for a specific tranche.
     *
     * @param tranche - A `StrategyTranche` from `getAll()` or `getById()`.
     * @returns min/max/capacity in ether-formatted USDC strings.
     */
    calculateDepositLimits(tranche: StrategyTranche): DepositLimits {
        const raw = tranche._raw;
        const min =
            parseFloat(raw.minimumDeposit) < 1 ? '1' : raw.minimumDeposit;

        const max =
            parseFloat(raw.maximumDeposit) > parseFloat(raw.poolCapacity)
                ? raw.poolCapacity
                : raw.maximumDeposit;

        return {
            min,
            max,
            availableCapacity: raw.poolCapacity,
        };
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    private mapPoolToStrategy(pool: PoolOverview): Strategy {
        const tranches: StrategyTranche[] = pool.tranches.map((t) => ({
            id: t.id,
            name: t.name,
            apy: parseFloat(t.apy),
            minApy: parseFloat(t.minApy),
            maxApy: parseFloat(t.maxApy),
            minimumDeposit: t.minimumDeposit,
            maximumDeposit: t.maximumDeposit,
            availableCapacity: t.poolCapacity,
            fixedTermOptions: t.fixedTermConfig.map(
                (ftd): FixedTermOption => ({
                    configId: ftd.configId,
                    apy: parseFloat(ftd.apy),
                    epochLockDuration: ftd.epochLockDuration,
                }),
            ),
            _raw: t,
        }));

        return {
            id: pool.id,
            name: pool.poolName,
            description: pool.description,
            isActive: pool.isActive,
            apy: pool.apy,
            tvl: pool.totalValueLocked,
            availableCapacity: pool.poolCapacity,
            capacityUtilisation: pool.poolCapacityPercentage,
            tranches,
            assetClass: pool.assetClass,
            apyStructure: pool.poolApyStructure,
            thumbnailUrl: pool.thumbnailImageUrl,
            bannerUrl: pool.bannerImageUrl,
            _raw: pool,
        };
    }
}

/**
 * A CMS "numeric" field as a finite number, or `null`. An empty or blank
 * string is UNAUTHORED, not zero.
 */
function finiteOrNull(value: unknown): number | null {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') {
        if (value.trim() === '') return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
}
