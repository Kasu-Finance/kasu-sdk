import { PoolTvlHistoryEntry } from '../domain/pool-tvl';
import { selectVisiblePools } from '../domain/pools';
import {
    finiteOrUndefined,
    groupRiskManagementItems,
    parseFacility,
    readCmsStartDate,
    securityStructureOf,
    splitBusinessTypes,
    StrategyRiskGroup,
} from '../domain/strategy-details';
import { pickShortDescription } from '../domain/strategy-summary';
import { DataService } from '../services/DataService/data-service';
import {
    PoolTvlHistoryOptions,
    PoolTvlHistoryResult,
} from '../services/DataService/tvl-history';
import {
    PoolDelegateProfileAndHistory,
    PoolOverview,
} from '../services/DataService/types';
import { UserLending } from '../services/UserLending/user-lending';

import {
    DepositLimits,
    FixedTermOption,
    OriginatorHistory,
    PlatformStats,
    Strategy,
    StrategyEndBorrowers,
    StrategyHistory,
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
        /**
         * The clock the CMS start dates are checked against (a date after it
         * is refused). Injected for tests; the current time otherwise.
         */
        private _now: () => Date = (): Date => new Date(),
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

    /**
     * The credit originator's ENTIRE lending history for a pool — since when,
     * total originated, loans outstanding, loss rate — read from the profile
     * `getOriginator` finds, each figure validated. `null` when no profile
     * lists the pool, or the profile authors none of the four.
     *
     * kasu-ui's Details tab shows these as its Credit Originator strip, and
     * hides the strip when there is no profile. The money figures are
     * editorial USD on every deployment: never FX-convert them. An XDC pool
     * resolves `null` today, as it does in kasu-ui (see `getOriginator`).
     *
     * Requires `directusUrl`, like every CMS-only read.
     */
    async getOriginatorHistory(
        poolId: string,
    ): Promise<OriginatorHistory | null> {
        const profile = await this.getOriginator(poolId);
        if (!profile) return null;
        const history: OriginatorHistory = {};
        const since = readCmsStartDate(
            profile.delegateLendingHistory,
            this._now(),
            { unixSeconds: true },
        );
        if (since !== undefined) history.since = since;
        const totalOriginated = finiteOrUndefined(
            profile.totalLoanFundsOriginated,
        );
        if (totalOriginated !== undefined) {
            history.totalOriginated = totalOriginated;
        }
        const loansOutstanding = finiteOrUndefined(
            profile.loansUnderManagement,
        );
        if (loansOutstanding !== undefined) {
            history.loansOutstanding = loansOutstanding;
        }
        const lossRate = finiteOrUndefined(profile.historicLossRate);
        if (lossRate !== undefined) history.lossRate = lossRate;
        return Object.keys(history).length > 0 ? history : null;
    }

    /**
     * The pool's Risk Management groups, from its CMS risk-management record:
     * each group with its items (name, the pool's description of it split
     * into lines, the shared tooltip), the groups in `RISK_GROUP_ORDER`
     * (Security & Recourse, Structural Controls, Financial Covenants,
     * Reporting Covenants, Key Eligibility Criteria, then any other in CMS
     * order). See `groupRiskManagementItems`.
     *
     * `null` when the pool has no record, or the record has no usable item —
     * then kasu-ui falls back to `Strategy.securityStructure`. XDC pools
     * resolve through the metadata mapping to their Base record, like
     * `getRiskPerformance`.
     *
     * Requires `directusUrl`, like every CMS-only read.
     */
    async getRiskManagementGroups(
        poolId: string,
    ): Promise<StrategyRiskGroup[] | null> {
        const metadataId = this._metadataIdOf(poolId);
        const records = await this._dataService.getRiskManagement();
        const record = records.find(
            (r) => String(r.poolIdFK).toLowerCase() === metadataId,
        );
        if (!record || !Array.isArray(record.items)) return null;
        const groups = groupRiskManagementItems(record.items);
        return groups.length > 0 ? groups : null;
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
     * The strategy's TVL (total lent by everyone) at every cycle boundary,
     * then as of now — the data behind a TVL chart. Ascending in time; the
     * last point (`kind: 'current'`) equals `strategy.tvl.total` when both
     * calls' reads succeed (see `PoolTvlHistoryEntry`).
     *
     * `tvl` is in display units of the deployment's OWN stable token (USDC on
     * Base and XDC USDC, AUDD on XDC AUDD); `timestamp` is unix SECONDS.
     * `{ count }` = the newest `count` epochs, `{ fromEpoch }` = from that
     * epoch on; `timeoutMs` (default 30 s) and `signal` bound the call. A
     * malformed option throws before any network read. See
     * `DataService.getPoolTvlHistory` for the reads, the cost and the errors.
     *
     * ```ts
     * const points = await kasu.strategies.getPoolTvlHistory(poolId, { count: 52 });
     * ```
     */
    async getPoolTvlHistory(
        poolId: string,
        options: PoolTvlHistoryOptions = {},
    ): Promise<PoolTvlHistoryEntry[]> {
        return await this._dataService.getPoolTvlHistory(poolId, options);
    }

    /**
     * `getPoolTvlHistory` plus `opening` — the newest clearing before the
     * window, read at its own block like every other point, or `null` when
     * the pool has none — from the same read. Pass the result to
     * `combineTvlHistories` as a leg with its `usdRate`: the opening is what
     * the leg held before its first point, so a window cut at a different
     * time on another chain does not count it 0. Same options and errors as
     * `getPoolTvlHistory`; the extra cost is one clearing row (or, for
     * `fromEpoch`, one small request) and one block.
     *
     * ```ts
     * const leg = await kasu.strategies.getPoolTvlHistoryWindow(poolId, { count: 52 });
     * // { entries: PoolTvlHistoryEntry[], opening: PoolTvlHistoryEntry | null }
     * ```
     */
    async getPoolTvlHistoryWindow(
        poolId: string,
        options: PoolTvlHistoryOptions = {},
    ): Promise<PoolTvlHistoryResult> {
        return await this._dataService.getPoolTvlHistoryWindow(poolId, options);
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
            subheading: nonEmptyOrUndefined(pool.subheading),
            description: pool.description,
            liteDescription: nonEmptyOrUndefined(pool.liteDescription),
            summary: pickShortDescription(pool),
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
            strategyHistory: strategyHistoryOf(pool, this._now()),
            endBorrowers: endBorrowersOf(pool),
            securityStructure: securityStructureOf(pool.security),
            _raw: pool,
        };
    }
}

/** `Strategy.strategyHistory`: an absent figure is an absent key. */
function strategyHistoryOf(pool: PoolOverview, now: Date): StrategyHistory {
    const history: StrategyHistory = {};
    const since = readCmsStartDate(pool.operatingSince, now);
    if (since !== undefined) history.since = since;
    const lenderInterestEarned = finiteOrUndefined(pool.yieldEarned);
    if (lenderInterestEarned !== undefined) {
        history.lenderInterestEarned = lenderInterestEarned;
    }
    return history;
}

/** Business Types and Facility Type, or `undefined` when neither is authored. */
function endBorrowersOf(pool: PoolOverview): StrategyEndBorrowers | undefined {
    const businessTypes = splitBusinessTypes(pool.industryExposure);
    const facility = parseFacility(pool.loanStructure);
    if (!businessTypes && !facility) return undefined;
    return {
        ...(businessTypes ? { businessTypes } : {}),
        ...(facility ? { facility } : {}),
    };
}

/**
 * A CMS text field as a string, or `undefined` when it is absent, not a
 * string, or empty (blank included) — the CMS stores an emptied field as `''`, and an empty
 * subheading must read as "none", not render an empty line.
 */
function nonEmptyOrUndefined(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0
        ? value
        : undefined;
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
