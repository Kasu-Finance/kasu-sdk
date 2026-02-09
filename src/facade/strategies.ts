import { DataService } from '../services/DataService/data-service';
import { PoolOverview } from '../services/DataService/types';
import { UserLending } from '../services/UserLending/user-lending';

import {
    DepositLimits,
    FixedTermOption,
    PlatformStats,
    Strategy,
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
    ) {}

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
            parseFloat(raw.minimumDeposit) < 1
                ? '1'
                : raw.minimumDeposit;

        const max = parseFloat(raw.maximumDeposit) > parseFloat(raw.poolCapacity)
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
