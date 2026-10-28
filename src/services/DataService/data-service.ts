import { readItems, readSingleton } from '@directus/sdk';
import { Provider } from '@ethersproject/abstract-provider';
import { BigNumber, providers, Signer } from 'ethers';
import { formatUnits, isAddress } from 'ethers/lib/utils';
import { GraphQLClient } from 'graphql-request';

import {
    ISystemVariablesAbi,
    ISystemVariablesAbi__factory,
    KasuPoolExternalTVLAbi,
    KasuPoolExternalTVLAbi__factory,
} from '../../contracts';
import { poolTvl, PoolTvlHistoryEntry } from '../../domain/pool-tvl';
import { epochRateToApy } from '../../domain/rates';
import { SdkConfig } from '../../sdk-config';
import { getSystemVariablesQuery } from '../Locking/queries';
import { SystemVariables } from '../Locking/types';
import { filterArray, isEmptyHistoryError } from '../shared';

import {
    createDirectusClient,
    KasuDirectusClient,
} from './directus-client';
import {
    BadAndDoubtfulDebtsItems,
    FinancialReportingDocumentsItemsDirectus,
    KeyCreditMetricsDirectus,
    NftBoostDirectus,
    PlatformOverviewDirectus,
    PoolDelegateProfileAndHistoryDirectus,
    PoolOverviewDirectus,
    PoolRepaymentItemsDirectus,
    RiskManagementGroupDirectus,
} from './directus-types';
import {
    getAllTrancheConfigurationsQuery,
    getAllTranchesQuery,
    getLendingPoolWithdrawalAndDepositsQuery,
    getPoolNameQuery,
    getPoolOverviewQuery,
} from './queries';
import {
    LendingPoolConfigurationSubgraph,
    LendingPoolSubgraph,
    LendingPoolSubgraphReturn,
    LendingPoolWithdrawalAndDepositSubgraph,
    TrancheConfigurationSubgraphResult,
    TrancheSubgraphResult,
} from './subgraph-types';
import {
    buildPoolTvlHistory,
    distinctBlocks,
    fetchOffChainTvlAtBlocks,
    fetchPoolBalancesAtBlocks,
    fetchPoolClearings,
    OffChainTvlReader,
    PoolTvlHistoryOptions,
    resolvePoolTvlHistoryWindow,
    retryingReader,
    validatePoolTvlHistoryOptions,
} from './tvl-history';
import {
    BadAndDoubtfulDebts,
    FinancialReportingDocuments,
    LendingTotals,
    PoolCreditMetrics,
    PoolDelegateProfileAndHistory,
    PoolOverview,
    PoolRepayment,
    PoolTranche,
    RiskManagement,
    RiskManagementItem,
    TrancheData,
} from './types';

/** Thrown by `getPoolTvlHistory` when no provider that serves past state is configured. */
export const NO_HISTORY_PROVIDER_MESSAGE =
    'getPoolTvlHistory: no history provider; pass historyProvider or set historyRpcUrl to an RPC that serves past state';

export class DataService {
    private readonly _graph: GraphQLClient;
    private readonly _externalTvlAbi: KasuPoolExternalTVLAbi;
    private readonly _systemVariablesAbi: ISystemVariablesAbi;
    private readonly _directus: KasuDirectusClient;
    private _directusPoolOverview: PoolOverviewDirectus[] | undefined;
    private _historyProvider: Provider | undefined;
    private readonly _readProvider: Provider | undefined;

    /**
     * @param historyProvider - a provider that SERVES PAST STATE (an archive
     * RPC), used only by `getPoolTvlHistory` for the off-chain TVL at old
     * blocks. Without one, `SdkConfig.historyRpcUrl` is used; with neither,
     * that one call throws `NO_HISTORY_PROVIDER_MESSAGE`. Never the default
     * provider: a pruned node refuses old blocks.
     */
    constructor(
        private _kasuConfig: SdkConfig,
        signerOrProvider: Signer | Provider,
        historyProvider?: Provider,
    ) {
        this._externalTvlAbi = KasuPoolExternalTVLAbi__factory.connect(
            _kasuConfig.contracts.ExternalTVL,
            signerOrProvider,
        );
        this._systemVariablesAbi = ISystemVariablesAbi__factory.connect(
            _kasuConfig.contracts.SystemVariables,
            signerOrProvider,
        );
        this._graph = new GraphQLClient(_kasuConfig.subgraphUrl);
        this._historyProvider = historyProvider;
        this._readProvider = Signer.isSigner(signerOrProvider)
            ? signerOrProvider.provider
            : signerOrProvider;

        this._directus = createDirectusClient(_kasuConfig.directusUrl);
    }

    private getUrlFromFile(fileName: string): string {
        return `${this._kasuConfig.directusUrl}assets/${fileName}`;
    }

    /**
     * Maps a pool ID to its metadata source pool ID.
     * Used for chains (XDC, Plume) that share Directus metadata with Base pools.
     */
    private getMetadataPoolId(poolId: string): string {
        const normalizedId = poolId.toLowerCase();
        return this._kasuConfig.poolMetadataMapping[normalizedId] ?? normalizedId;
    }

    /**
     * Maps an array of pool IDs to their metadata source pool IDs.
     */
    private getMetadataPoolIds(poolIds: string[]): string[] {
        return poolIds.map((id) => this.getMetadataPoolId(id));
    }

    calculatePoolCapacity(
        poolCapacities: number[],
        poolCapacityPercentages: number[],
        index: number,
        spillOver: number,
        lendingPoolSubgraph: LendingPoolSubgraph,
        lendingPoolConfig: LendingPoolConfigurationSubgraph,
    ): { poolCapacity: number[]; poolCapacityPercentage: number[] } {
        const desiredDrawAmount = lendingPoolConfig.desiredDrawAmount; // subgraph
        const desiredTrancheRatio =
            lendingPoolConfig.tranchesConfig[index].desiredRatio;

        const targetDrawAmount =
            parseFloat(desiredDrawAmount) *
            (parseFloat(desiredTrancheRatio) / 100);

        const pendingDeposits =
            parseFloat(
                lendingPoolSubgraph.pendingPool.totalPendingDepositAmounts[
                    index
                ],
            ) - spillOver;

        const balance = parseFloat(lendingPoolSubgraph.tranches[index].balance); // subgraph

        const targetAmount = balance + targetDrawAmount;

        const remainingCapacity = Math.max(
            targetDrawAmount - pendingDeposits,
            0,
        );

        const remainingCapacityPercentage =
            targetAmount != 0 ? remainingCapacity / targetAmount : 0;

        const remainingCapacitySpillover = Math.min(
            targetDrawAmount - pendingDeposits,
            0,
        );

        poolCapacities.push(remainingCapacity);
        poolCapacityPercentages.push(remainingCapacityPercentage);
        if (index === lendingPoolConfig.tranchesConfig.length - 1) {
            return {
                poolCapacity: poolCapacities,
                poolCapacityPercentage: poolCapacityPercentages,
            };
        }
        return this.calculatePoolCapacity(
            poolCapacities,
            poolCapacityPercentages,
            index + 1,
            remainingCapacitySpillover,
            lendingPoolSubgraph,
            lendingPoolConfig,
        );
    }

    /**
     * The subgraph's per-epoch `interestRate` compounded into an APY.
     * Unchanged arithmetic — `EPOCHS_IN_YEAR` and the formula now come from
     * `domain/rates` so this file and `KSULocking` cannot drift apart.
     */
    calculateApyForTranche(interestRate: string): number {
        return epochRateToApy(parseFloat(interestRate));
    }

    async getPlatformOverview(): Promise<PlatformOverviewDirectus> {
        return await this._directus.request(readSingleton('PlatformOverview'));
    }

    async getNftBoost(): Promise<Omit<NftBoostDirectus, 'id'>> {
        return await this._directus.request(readSingleton('NftBoost'));
    }

    async getOffChainTvl(poolIds: string[]): Promise<Map<string, string>> {
        const tvlMap = new Map<string, string>();

        try {
            const results = await Promise.all(
                poolIds.map(
                    async (id) =>
                        [
                            id,
                            await this._externalTvlAbi.externalTVLOfPool(id),
                        ] as const,
                ),
            );

            for (const [id, tvl] of results) {
                tvlMap.set(id, formatUnits(tvl, this._kasuConfig.stableAssetDecimals));
            }
        } catch (error) {
            console.error('getOffChainTvl :', error);
        }

        return tvlMap;
    }

    /**
     * The pool's TVL — the total lent into it by everyone — at every cycle
     * boundary, then as of now: the data behind a TVL chart.
     *
     * One `clearing` point per FINISHED clearing, read at the block it
     * finished in (`LendingPoolClearing.endBlockNumber`), then one `current`
     * point at the latest block. Every point is `poolTvl(onChain, offChain)`,
     * the definition `getPoolOverview` uses for `totalValueLocked.total`:
     *
     * - on-chain: `lendingPool.balance` from the subgraph, read with
     *   time-travel queries (`block: { number }`);
     * - off-chain: `ExternalTVL.externalTVLOfPool(pool)` at the same block,
     *   through the HISTORY provider (see the constructor). 0 before the
     *   contract was deployed (decided by `getCode`); any failed read throws.
     *
     * So the last point always equals today's `totalValueLocked.total`.
     *
     * Units: `tvl` in display units of the deployment's own stable token
     * (USDC on Base and XDC USDC, AUDD on XDC AUDD); `timestamp` in unix
     * seconds. Ascending in time. See `PoolTvlHistoryEntry`.
     *
     * Cost: one subgraph request for the clearings (per thousand), one per
     * hundred distinct clearing blocks, a `currentEpochNumber` read; then, on
     * the history provider, one `externalTVLOfPool` per distinct block plus
     * the latest, and one to about log2(n) `getCode`s — at most
     * `TVL_HISTORY_RPC_CONCURRENCY` in flight.
     *
     * `[]` for a pool the subgraph does not know, for a window with no epoch
     * in it, and on a LITE deployment whose subgraph lacks the entities. On a
     * full deployment that schema error throws, like every network, indexing
     * or past-state failure.
     *
     * @throws RangeError on a malformed `fromEpoch` / `count`, TypeError on a
     * pool id that is not an address, and `NO_HISTORY_PROVIDER_MESSAGE` when
     * the deployment has an `ExternalTVL` contract but no history provider —
     * all before any network read.
     */
    async getPoolTvlHistory(
        poolId: string,
        options: PoolTvlHistoryOptions = {},
    ): Promise<PoolTvlHistoryEntry[]> {
        validatePoolTvlHistoryOptions(options);
        if (!isAddress(poolId)) {
            throw new TypeError(
                `getPoolTvlHistory: poolId must be an address, got ${String(poolId)}`,
            );
        }
        const pool = poolId.toLowerCase();
        const reader = this._offChainTvlReader(pool);
        const graph = <T>(
            document: string,
            variables: Record<string, unknown>,
        ): Promise<T> => this._graph.request<T>(document, variables);

        try {
            const [currentEpochNumber, { clearings, snapshot }] =
                await Promise.all([
                    this._systemVariablesAbi.currentEpochNumber(),
                    fetchPoolClearings(graph, pool, options.fromEpoch ?? 0),
                ]);
            const currentEpoch = currentEpochNumber.toNumber();

            const window = resolvePoolTvlHistoryWindow(options, currentEpoch);
            const poolNow = snapshot.pool;
            if (!window || !poolNow) return [];

            const inWindow = clearings.filter(
                (c) =>
                    c.epochId >= window.fromEpoch &&
                    c.epochId <= window.toEpoch,
            );
            const blocks = distinctBlocks(inWindow);
            const withCurrent = window.toEpoch >= currentEpoch;

            const [{ balances }, offChainRead, currentTime] =
                await Promise.all([
                    fetchPoolBalancesAtBlocks(graph, pool, blocks),
                    reader
                        ? fetchOffChainTvlAtBlocks(reader, blocks, {
                              withLatest: withCurrent,
                          })
                        : {
                              offChain: new Map(
                                  blocks.map((b) => [b, BigNumber.from(0)]),
                              ),
                              latest: null,
                          },
                    withCurrent
                        ? this._latestBlockTime(snapshot.meta)
                        : Promise.resolve(0),
                ]);

            return buildPoolTvlHistory({
                clearings: inWindow,
                balances,
                offChain: offChainRead.offChain,
                current: withCurrent
                    ? {
                          epochId: currentEpoch,
                          timestamp: currentTime,
                          balance: poolNow.balance,
                          offChain: offChainRead.latest ?? BigNumber.from(0),
                      }
                    : null,
                decimals: this._kasuConfig.stableAssetDecimals,
            });
        } catch (error) {
            if (isEmptyHistoryError(error, this._kasuConfig.isLiteDeployment)) {
                return [];
            }
            throw error;
        }
    }

    /**
     * The past-state reads of `ExternalTVL` for one pool, on the history
     * provider. `null` when the deployment has no `ExternalTVL` contract —
     * `getPoolOverview` reads its off-chain TVL as 0 there too.
     */
    private _offChainTvlReader(poolId: string): OffChainTvlReader | null {
        const address = this._kasuConfig.contracts.ExternalTVL;
        if (!address || /^0x0{40}$/i.test(address)) return null;

        const provider = this._resolveHistoryProvider();
        if (!provider) throw new Error(NO_HISTORY_PROVIDER_MESSAGE);

        const contract = KasuPoolExternalTVLAbi__factory.connect(
            address,
            provider,
        );
        return retryingReader({
            readAt: (block) =>
                contract.externalTVLOfPool(poolId, { blockTag: block }),
            hasCodeAt: async (block) =>
                (await provider.getCode(address, block)) !== '0x',
        });
    }

    private _resolveHistoryProvider(): Provider | undefined {
        if (!this._historyProvider && this._kasuConfig.historyRpcUrl) {
            // Through the `ethers` namespace, so the consumer's own build
            // (Node or browser) is used — see `defaultProvider` in the facade.
            this._historyProvider = new providers.StaticJsonRpcProvider(
                this._kasuConfig.historyRpcUrl,
            );
        }
        return this._historyProvider;
    }

    /** Unix seconds of the subgraph's latest indexed block. */
    private async _latestBlockTime(
        meta:
            | { block: { number: number; timestamp: number | null } }
            | null
            | undefined,
    ): Promise<number> {
        if (!meta) {
            throw new Error('getPoolTvlHistory: the subgraph returned no _meta block');
        }
        if (typeof meta.block.timestamp === 'number') {
            return meta.block.timestamp;
        }
        const provider = this._resolveHistoryProvider() ?? this._readProvider;
        if (!provider) {
            throw new Error(
                'getPoolTvlHistory: the subgraph gave no block time and no provider is available to read it',
            );
        }
        return (await provider.getBlock(meta.block.number)).timestamp;
    }

    async getPoolOverview(
        epochId: string,
        id_in?: string[],
    ): Promise<PoolOverview[]> {
        const trancheNames: string[][] = [
            ['Senior'],
            ['Junior', 'Senior'],
            ['Junior', 'Mezzanine', 'Senior'],
        ];

        const poolOverviewResults: LendingPoolSubgraphReturn =
            await this._graph.request(getPoolOverviewQuery(id_in), {
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                epochId,
            });

        if (!this._directusPoolOverview) {
            if (this._kasuConfig.directusUrl) {
                try {
                    this._directusPoolOverview = await this._directus.request(
                        readItems('PoolOverview', {
                            filter: {
                                enabled: {
                                    _eq: true,
                                },
                            },
                        }),
                    );
                } catch (error) {
                    console.warn(
                        'Directus fetch failed, falling back to on-chain data only:',
                        error,
                    );
                    this._directusPoolOverview = [];
                }
            } else {
                this._directusPoolOverview = [];
            }
        }

        const offchainTvlMap = await this.getOffChainTvl(
            poolOverviewResults.lendingPools.map(({ id }) => id),
        );

        const retn: PoolOverview[] = [];
        for (const lendingPoolSubgraph of poolOverviewResults.lendingPools) {
            // Use metadata mapping if available (for XDC/Plume pools that share metadata with Base)
            const metadataPoolId =
                this._kasuConfig.poolMetadataMapping[lendingPoolSubgraph.id] ??
                lendingPoolSubgraph.id;

            const lendingPoolDirectus: PoolOverviewDirectus | undefined =
                this._directusPoolOverview.find(
                    (r) => r.id.toLowerCase() === metadataPoolId,
                );

            const lendingPoolConfig = lendingPoolSubgraph.configuration;

            if (!lendingPoolDirectus) {
                console.warn(
                    "Couldn't find directus pool for id: ",
                    lendingPoolSubgraph.id,
                    metadataPoolId !== lendingPoolSubgraph.id
                        ? `(mapped from ${metadataPoolId})`
                        : '',
                );
                // When Directus is unavailable or pool has no CMS entry,
                // use a fallback so the pool is still returned with on-chain data.
            }
            const poolCapacities = this.calculatePoolCapacity(
                [],
                [],
                0,
                0,
                lendingPoolSubgraph,
                lendingPoolConfig,
            );
            const tranches: TrancheData[] = lendingPoolSubgraph.tranches
                .map((tranche) => {
                    const trancheConfig =
                        lendingPoolSubgraph.configuration.tranchesConfig.find(
                            (r) => r.id == tranche.id,
                        );
                    if (!trancheConfig) {
                        console.warn(
                            "Couldn't find tranche config for id: ",
                            tranche.id,
                        );
                        return null;
                    }

                    const interestUpdates =
                        trancheConfig.lendingPoolTrancheInterestRateUpdates;

                    const interestRate = interestUpdates.length
                        ? interestUpdates[0].epochInterestRate
                        : trancheConfig.interestRate;

                    const baseApy = this.calculateApyForTranche(interestRate);

                    let minApy = baseApy;
                    let maxApy = baseApy;

                    const fixedTermConfig =
                        trancheConfig.lendingPoolTrancheFixedTermConfigs.map(
                            (fixedTermConfig) => {
                                const fixedTermApy =
                                    this.calculateApyForTranche(
                                        fixedTermConfig.epochInterestRate,
                                    );

                                minApy = Math.min(minApy, fixedTermApy);
                                maxApy = Math.max(maxApy, fixedTermApy);

                                return {
                                    configId: fixedTermConfig.configId,
                                    apy: fixedTermApy.toString(),
                                    epochLockDuration:
                                        fixedTermConfig.epochLockDuration,
                                    epochInterestRate:
                                        fixedTermConfig.epochInterestRate,
                                    fixedTermDepositStatus:
                                        fixedTermConfig.fixedTermDepositStatus,
                                    fixedTermDepositAllowlist:
                                        fixedTermConfig.fixedTermDepositAllowlist.map(
                                            (allowList) => ({
                                                isAllowlisted:
                                                    allowList.isAllowlisted,
                                                userId: allowList.user.id,
                                            }),
                                        ),
                                };
                            },
                        );

                    const averageApy = fixedTermConfig.length
                        ? fixedTermConfig.reduce(
                              (total, cur) => (total += parseFloat(cur.apy)),
                              0,
                          ) / fixedTermConfig.length
                        : baseApy;

                    return {
                        id: tranche.id,
                        balance: tranche.balance,
                        apy: baseApy.toString(),
                        minApy: minApy.toString(),
                        maxApy: maxApy.toString(),
                        averageApy: averageApy.toString(),
                        interestRate,
                        maximumDeposit: trancheConfig.maxDepositAmount,
                        minimumDeposit: trancheConfig.minDepositAmount,
                        poolCapacityPercentage:
                            poolCapacities.poolCapacityPercentage[
                                parseInt(tranche.orderId)
                            ].toString(),
                        poolCapacity:
                            poolCapacities.poolCapacity[
                                parseInt(tranche.orderId)
                            ].toString(),
                        name: trancheNames[
                            lendingPoolSubgraph.tranches.length - 1
                        ][parseInt(tranche.orderId)],
                        fixedTermConfig,
                    };
                })
                .filter((tranche) => tranche !== null);

            const poolCapacitySum = poolCapacities.poolCapacity.reduce(
                (a, b) => a + b,
                0,
            );

            const poolCapacityPercentageSum =
                poolCapacities.poolCapacityPercentage.reduce(
                    (a, b) => a + b,
                    0,
                ) / poolCapacities.poolCapacity.length;

            const trancheBalanceSum = lendingPoolSubgraph.tranches.reduce(
                (a, b) => a + parseFloat(b.balance),
                0,
            );

            let averageApy = 0;
            for (const tranche of lendingPoolSubgraph.tranches) {
                const trancheData = tranches.find(
                    (r) => r.id.toLowerCase() == tranche.id,
                );
                if (!trancheData) {
                    console.warn(
                        "Couldn't find tranche directus for id: ",
                        tranche.id,
                    );
                    continue;
                }
                const weight =
                    trancheBalanceSum == 0
                        ? 0
                        : parseFloat(tranche.balance) / trancheBalanceSum;
                averageApy += parseFloat(trancheData.averageApy) * weight;
            }

            const offChainTvl =
                offchainTvlMap.get(lendingPoolSubgraph.id) ?? '0';

            const poolOverview: PoolOverview = {
                id: lendingPoolSubgraph.id,
                security: lendingPoolDirectus?.security ?? [],
                enabled: lendingPoolDirectus?.enabled ?? true,
                isOversubscribed:
                    lendingPoolDirectus?.oversubscribed ?? false,
                apy: averageApy,
                description: lendingPoolDirectus?.description ?? '',
                liteDescription: lendingPoolDirectus?.liteDescription ?? '',
                thumbnailImageUrl: lendingPoolDirectus?.thumbnailImage
                    ? this.getUrlFromFile(lendingPoolDirectus.thumbnailImage)
                    : '',
                bannerImageUrl: lendingPoolDirectus?.bannerImage
                    ? this.getUrlFromFile(lendingPoolDirectus.bannerImage)
                    : '',
                strategyDeckUrl: lendingPoolDirectus?.strategyDeck
                    ? this.getUrlFromFile(lendingPoolDirectus.strategyDeck)
                    : '',
                assetClass: lendingPoolDirectus?.assetClass ?? '',
                industryExposure:
                    lendingPoolDirectus?.industryExposure ?? '',
                poolApyStructure:
                    lendingPoolDirectus?.poolApyStructure ?? 'Variable',
                apyExpiryDate:
                    lendingPoolDirectus?.apyExpiryDate ?? null,
                poolInvestmentTerm:
                    lendingPoolDirectus?.poolInvestmentTerm ?? '',
                loanStructure: lendingPoolDirectus?.loanStructure ?? '',
                poolName:
                    lendingPoolDirectus?.poolName ??
                    lendingPoolSubgraph.name,
                subheading: lendingPoolDirectus?.subheading,
                operatingSince: lendingPoolDirectus?.operatingSince,
                totalValueLocked: {
                    // The one TVL definition, shared with getPoolTvlHistory.
                    total: poolTvl(
                        lendingPoolSubgraph.balance,
                        offChainTvl,
                    ).toString(),
                    offchain: offChainTvl,
                },
                loansUnderManagement:
                    lendingPoolDirectus?.loansUnderManagement ?? '0',
                yieldEarned: lendingPoolSubgraph.totalUserInterestAmount,
                poolCapacity: poolCapacitySum.toString(),
                poolCapacityPercentage: poolCapacityPercentageSum.toString(),
                activeLoans: lendingPoolDirectus?.activeLoans ?? '0',
                loanFundsOriginated:
                    lendingPoolDirectus?.loanFundsOriginated ?? '0',
                tranches: tranches,
                isActive: !lendingPoolSubgraph.isStopped,
                requestEpochsInAdvance:
                    lendingPoolSubgraph.configuration
                        .lendingPoolWithdrawalConfig.requestEpochsInAdvance,
            };

            // When Directus is available, show only enabled pools.
            // When Directus is unavailable, include all pools.
            if (poolOverview.enabled) {
                retn.push(poolOverview);
            }
        }

        return retn;
    }

    async getPerformanceFee(): Promise<number> {
        const systemVariables: SystemVariables = await this._graph.request(
            getSystemVariablesQuery,
        );

        return parseFloat(systemVariables.systemVariables.performanceFee);
    }

    async getRiskManagement(id_in?: string[]): Promise<RiskManagement[]> {
        const [
            resultDirectusRiskManagement,
            resultDirectusRiskManagementItem,
            resultDirectusRiskManagementGroups,
        ] = await Promise.all([
            this._directus.request(readItems('RiskManagement')),
            this._directus.request(readItems('RiskManagementItems')),
            this._directus.request(readItems('RiskManagementGroups')),
        ]);

        const groupMapper: Partial<
            Record<string, RiskManagementGroupDirectus>
        > = resultDirectusRiskManagementGroups.reduce(
            (acc, cur) => ({ ...acc, [cur.name]: cur }),
            {},
        );

        const itemMapper: Partial<Record<string, RiskManagementItem>> =
            resultDirectusRiskManagementItem.reduce((acc, cur) => {
                const groupName = groupMapper[cur.group.key]?.name;

                if (!groupName) return acc;

                return {
                    ...acc,
                    [cur.name]: {
                        ...cur,
                        group: groupName,
                    },
                };
            }, {});

        const riskManagement = resultDirectusRiskManagement.map((risk) => {
            const items = risk.riskManagementItems
                .map((data) => {
                    const { riskManagementItem, ...rest } = data;

                    const item = itemMapper[riskManagementItem.key];

                    if (!item) return null;

                    return {
                        ...rest,
                        ...item,
                    };
                })
                .filter((item) => item !== null);

            return {
                id: risk.id,
                poolIdFK: risk.poolIdFK.toLowerCase(),
                items,
                riskPerformance: {
                    id: risk.id,
                    firstLossCapital: risk.firstLossCapital,
                    poolLossRate: risk.poolLossRate,
                    independentRiskScore: risk.independentRiskScore,
                    communityRating: risk.communityRating,
                },
            };
        });

        return filterArray(riskManagement, id_in);
    }

    async getPoolDelegateProfileAndHistory(
        id_in?: string[],
    ): Promise<PoolDelegateProfileAndHistory[]> {
        const poolDelegateProfileAndHistoryDirectus: PoolDelegateProfileAndHistoryDirectus[] =
            (await this._directus.request(
                readItems('PoolDelegateProfileAndHistory', {
                    fields: ['*', { otherPools: ['*'] }],
                }),
            )) as unknown as PoolDelegateProfileAndHistoryDirectus[];

        const [poolNames, directusPoolNames] = await Promise.all([
            this._graph.request<{
                lendingPools: Pick<
                    LendingPoolSubgraph,
                    'name' | 'id' | 'isStopped'
                >[];
            }>(getPoolNameQuery, {
                ids: poolDelegateProfileAndHistoryDirectus.flatMap((directus) =>
                    directus.otherPools.map(
                        (delegate) => delegate.PoolOverview_id,
                    ),
                ),
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
            }),
            this._directus.request(
                readItems('PoolOverview', {
                    fields: ['id', 'poolName', 'subheading', 'oversubscribed'],
                }),
            ),
        ]);

        const retn: PoolDelegateProfileAndHistory[] = [];
        for (const data of poolDelegateProfileAndHistoryDirectus) {
            const otherKASUPools: PoolDelegateProfileAndHistory['otherKASUPools'] =
                [];

            for (const otherPool of data.otherPools) {
                const found = poolNames.lendingPools.find(
                    ({ id }) => otherPool.PoolOverview_id === id,
                );

                if (!found) continue;

                const directusName = directusPoolNames.find(
                    ({ id }) => id === found.id,
                );

                const poolName = directusName?.poolName ?? found.name;

                otherKASUPools.push({
                    id: found.id,
                    name: directusName?.subheading
                        ? `${poolName} - ${directusName.subheading}`
                        : poolName,
                    isActive: !found.isStopped,
                    isOversubscribed: Boolean(directusName?.oversubscribed),
                });
            }

            retn.push({
                id: data.id,
                delegateLendingHistory: data.delegateLendingHistory,
                assetClasses: data.assetClasses,
                otherKASUPools,
                totalLoanFundsOriginated: data.totalLoanFundsOriginated,
                totalLoansOriginated: data.totalLoansOriginated,
                loansUnderManagement: data.loansUnderManagement,
                historicLossRate: data.historicLossRate,
                region: data.region,
                onTimeRate: data.onTimeRate,
            });
        }
        return filterArray(retn, id_in);
    }

    async getPoolTranches(
        epochId: string,
        id_in?: string[],
    ): Promise<PoolTranche[]> {
        const subgraphResults: TrancheSubgraphResult =
            await this._graph.request(getAllTranchesQuery, {
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
            });
        const subgraphConfigurationResults: TrancheConfigurationSubgraphResult =
            await this._graph.request(getAllTrancheConfigurationsQuery, {
                unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                epochId,
            });
        const retn: PoolTranche[] = [];
        for (const trancheSubgraph of subgraphResults.lendingPoolTranches) {
            const configuration =
                subgraphConfigurationResults.lendingPoolTrancheConfigurations.find(
                    (r) => r.id == trancheSubgraph.id,
                );
            if (!configuration) {
                console.warn(
                    "Couldn't find tranche configuration for id: ",
                    trancheSubgraph.id,
                );
                continue;
            }

            const interestUpdates =
                configuration.lendingPoolTrancheInterestRateUpdates;

            const interestRate = interestUpdates.length
                ? interestUpdates[0].epochInterestRate
                : configuration.interestRate;

            const tranche: PoolTranche = {
                id: trancheSubgraph.id,
                poolIdFK: trancheSubgraph.lendingPool.id.toLowerCase(),
                apy: this.calculateApyForTranche(interestRate).toString(),
                minimalDepositThreshold: configuration.minDepositAmount,
                maximalDepositThreshold: configuration.maxDepositAmount,
            };
            retn.push(tranche);
        }
        return filterArray(retn, id_in);
    }

    async getBadAndDoubtfulDebts(
        id_in?: string[],
    ): Promise<BadAndDoubtfulDebts[]> {
        const [badAndDoubtfulDebtsItemsDirectus, badAndDoubtfulDebtsDirectus] =
            await Promise.all([
                this._directus.request(readItems('BadAndDoubtfulDebtsItems')),
                this._directus.request(readItems('BadAndDoubtfulDebts')),
            ]);

        const itemsMapper: Partial<Record<string, BadAndDoubtfulDebtsItems>> =
            badAndDoubtfulDebtsItemsDirectus.reduce(
                (acc, cur) => ({ ...acc, [cur.id]: cur }),
                {},
            );

        const test = badAndDoubtfulDebtsDirectus.map((debts) => {
            const items = debts.items
                .map((debtItem) => {
                    const { item, ...metric } = debtItem;

                    const itemMetric = itemsMapper[item.key];

                    if (!itemMetric) return null;

                    return {
                        ...metric,
                        item: itemMetric,
                    };
                })
                .filter((item) => item !== null);

            return {
                ...debts,
                items,
            };
        });

        return filterArray(test, id_in);
    }

    async getPoolCreditMetrics(id_in?: string[]): Promise<PoolCreditMetrics[]> {
        const [keyCreditMetricsDirectus, poolCreditMetricsDirectus] =
            await Promise.all([
                this._directus.request(readItems('KeyCreditMetrics')),
                this._directus.request(readItems('PoolCreditMetrics')),
            ]);

        const keyCreditMetricsMapper: Partial<
            Record<string, KeyCreditMetricsDirectus>
        > = keyCreditMetricsDirectus.reduce(
            (acc, cur) => ({ ...acc, [cur.name]: cur }),
            {},
        );

        const poolCreditMetrics = poolCreditMetricsDirectus.map((pool) => {
            const metrics = pool.keyCreditMetrics
                .map((data) => {
                    const { keyCreditMetric, ...metric } = data;

                    const keyMetric =
                        keyCreditMetricsMapper[keyCreditMetric.key];

                    if (!keyMetric) return null;

                    return {
                        ...metric,
                        keyCreditMetric: keyMetric,
                    };
                })
                .filter((metric) => metric !== null);

            return {
                ...pool,
                keyCreditMetrics: metrics,
            };
        });

        return filterArray(poolCreditMetrics, id_in);
    }

    async getFinancialReportingDocuments(
        id_in?: string[],
    ): Promise<FinancialReportingDocuments[]> {
        const [
            financialReportingDocumentsDirectus,
            financialReportingDocumentsItemsDirectus,
        ] = await Promise.all([
            this._directus.request(readItems('FinancialReportingDocuments')),
            this._directus.request(
                readItems('FinancialReportingDocumentsItems'),
            ),
        ]);

        const documentItemsMapper: Partial<
            Record<number, FinancialReportingDocumentsItemsDirectus>
        > = financialReportingDocumentsItemsDirectus.reduce(
            (acc, cur) => ({ ...acc, [cur.id]: cur }),
            {},
        );

        const mapDocumentFilePath = financialReportingDocumentsDirectus
            .map((report) => {
                if (!report.documents) return null;

                const documents = report.documents
                    .map((documentId) => {
                        const document = documentItemsMapper[documentId];

                        if (!document) return null;

                        return {
                            ...document,
                            document: this.getUrlFromFile(document.document),
                        };
                    })
                    .filter((document) => document !== null);

                return {
                    ...report,
                    documents,
                };
            })
            .filter((report) => report !== null);

        return filterArray(mapDocumentFilePath, id_in);
    }

    async getRepayments(id_in?: string[]): Promise<PoolRepayment[]> {
        const [poolRepaymentDirectus, poolRepaymentItemsDirectus] =
            await Promise.all([
                this._directus.request(
                    readItems('PoolRepayments', {
                        filter: {
                            poolIdFK: {
                                _nin: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
                            },
                        },
                    }),
                ),
                this._directus.request(readItems('PoolRepaymentItems')),
            ]);

        const repaymentItemsMapper: Partial<
            Record<string, PoolRepaymentItemsDirectus>
        > = poolRepaymentItemsDirectus.reduce(
            (acc, cur) => ({ ...acc, [cur.name]: cur }),
            {},
        );

        const lendingPoolsWithdrawalsAndDepositsSubgraph: LendingPoolWithdrawalAndDepositSubgraph =
            await this._graph.request(
                getLendingPoolWithdrawalAndDepositsQuery,
                { unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS },
            );
        const retn: PoolRepayment[] = [];
        for (const data of poolRepaymentDirectus) {
            // Find subgraph pool that maps to this Directus pool
            // On non-Base chains, subgraph pool IDs are different from Directus poolIdFK
            // Use getMetadataPoolId to map subgraph pool ID -> Directus/Base pool ID
            const lendingPoolSubgraph =
                lendingPoolsWithdrawalsAndDepositsSubgraph.lendingPools.find(
                    (pool) =>
                        this.getMetadataPoolId(pool.id) ===
                        data.poolIdFK.toLowerCase(),
                );

            if (lendingPoolSubgraph === undefined) {
                continue;
            }

            const currentDepositRequests = parseFloat(
                lendingPoolSubgraph.pendingPool.totalPendingDepositsAmount,
            );

            let sumTotalPendingWithdrawalShares = 0.0;

            lendingPoolSubgraph.pendingPool.totalPendingWithdrawalShares.forEach(
                (shares) => {
                    sumTotalPendingWithdrawalShares += parseFloat(shares);
                },
            );

            const cumulativeLendingAndWithdrawals =
                data.CumulativeLendingAndWithdrawals.map((fund) => {
                    let calculatedValue = 0;

                    if (fund.key === 'netLendingWithdrawals') {
                        calculatedValue =
                            parseFloat(
                                lendingPoolSubgraph.totalDepositsAccepted,
                            ) -
                            parseFloat(
                                lendingPoolSubgraph.totalWithdrawalsAccepted,
                            );
                    }

                    if (fund.key === 'cumulativeLending') {
                        calculatedValue = parseFloat(
                            lendingPoolSubgraph.totalDepositsAccepted,
                        );
                    }

                    if (fund.key === 'cumulativeLendingWithdrawals') {
                        calculatedValue = parseFloat(
                            lendingPoolSubgraph.totalWithdrawalsAccepted,
                        );
                    }

                    const repaymentItem =
                        repaymentItemsMapper[fund.repaymentItem.key];

                    if (!repaymentItem) return null;

                    return {
                        value: fund.value ?? calculatedValue,
                        ...repaymentItem,
                    };
                }).filter((item) => item !== null);

            const lendingAndWithdrawalRequests =
                data.LendingAndWithdrawalRequests.map((fund) => {
                    let calculatedValue = 0;

                    if (fund.key === 'netLendingWithdrawalRequests') {
                        calculatedValue =
                            currentDepositRequests -
                            sumTotalPendingWithdrawalShares;
                    }

                    if (fund.key === 'currentLendingRequests') {
                        calculatedValue = currentDepositRequests;
                    }

                    if (fund.key === 'currentLendingWithdrawalRequests') {
                        calculatedValue = sumTotalPendingWithdrawalShares;
                    }

                    const repaymentItem =
                        repaymentItemsMapper[fund.repaymentItem.key];

                    if (!repaymentItem) return null;

                    return {
                        value: fund.value ?? calculatedValue,
                        ...repaymentItem,
                    };
                }).filter((item) => item !== null);

            const poolRepayment: PoolRepayment = {
                id: data.id,
                poolIdFK: data.poolIdFK.toLowerCase(),
                currentTotalEndBorrowers: data.currentTotalEndBorrowers,
                repaymentsFileUrl: this.getUrlFromFile(data.repaymentsFile),
                upcomingLendingFundsFlow: data.UpcomingLendingFundsFlow.map(
                    (fund) => {
                        const repaymentItem =
                            repaymentItemsMapper[fund.repaymentItem.key];

                        if (!repaymentItem) return null;

                        return {
                            value: fund.value,
                            ...repaymentItem,
                        };
                    },
                ).filter((item) => item !== null),
                cumulativeLendingFundsFlow: data.CumulativeLendingFundsFlow.map(
                    (fund) => {
                        const repaymentItem =
                            repaymentItemsMapper[fund.repaymentItem.key];

                        if (!repaymentItem) return null;

                        return {
                            value: fund.value,
                            ...repaymentItem,
                        };
                    },
                ).filter((item) => item !== null),
                cumulativeLendingAndWithdrawals,
                lendingAndWithdrawalRequests,
            };

            retn.push(poolRepayment);
        }
        return filterArray(retn, id_in);
    }

    async getLendingTotals(
        poolOverviews: PoolOverview[],
    ): Promise<LendingTotals> {
        const riskManagements: RiskManagement[] =
            await this.getRiskManagement();
        const retn: LendingTotals = {
            totalValueLocked: 0,
            loansUnderManagement: 0,
            totalLoanFundsOriginated: 0,
            totalLossRate: 0,
            totalYieldEarned: 0,
        };
        for (const poolOverview of poolOverviews) {
            retn.totalValueLocked += parseFloat(
                poolOverview.totalValueLocked.total,
            );
            retn.loansUnderManagement += parseFloat(
                poolOverview.loansUnderManagement,
            );
            retn.totalLoanFundsOriginated += parseFloat(
                poolOverview.loanFundsOriginated,
            );
            retn.totalYieldEarned += parseFloat(poolOverview.yieldEarned);
        }
        for (const poolOverview of poolOverviews) {
            // Map to metadata pool ID for Directus lookup (XDC pools → Base pools)
            const metadataPoolId = this.getMetadataPoolId(poolOverview.id);
            const riskManagement = riskManagements.find(
                (rm) =>
                    rm.poolIdFK.toLowerCase() === metadataPoolId.toLowerCase(),
            );
            if (!riskManagement) {
                console.warn(
                    "Couldn't find risk management for id: ",
                    poolOverview.id,
                    metadataPoolId !== poolOverview.id
                        ? `(mapped to ${metadataPoolId})`
                        : '',
                );
                continue;
            }
            const weight =
                retn.totalLoanFundsOriginated === 0
                    ? 0
                    : parseFloat(poolOverview.loanFundsOriginated) /
                      retn.totalLoanFundsOriginated;
            retn.totalLossRate +=
                riskManagement.riskPerformance.poolLossRate * weight;
        }
        return retn;
    }

    calculateCompounding(
        amount: number,
        epochInterestRate: number,
        daysInvested: number,
        interestFee: number,
    ): number[] {
        const COMPOUNDING_PERIOD = 7;
        const earnedAmount: number[] = [];

        const epochInterestRateAfterFee = epochInterestRate * (1 - interestFee);

        for (let i = 0; i < daysInvested + 1; i++) {
            const investmentEpochs = i / COMPOUNDING_PERIOD;

            const interestEarned =
                amount *
                (Math.pow(1 + epochInterestRateAfterFee, investmentEpochs) - 1);

            earnedAmount.push(interestEarned);
        }

        return earnedAmount;
    }

    calculateBonusInterestEarnings(
        earnedAmounts: number[],
        amount: number,
        bonusEpochInterest: number,
    ): number[] {
        const COMPOUNDING_PERIOD = 7;
        const dailyInterest = bonusEpochInterest / COMPOUNDING_PERIOD;

        const bonusInterestEarned: number[] = [0];

        for (let i = 1; i < earnedAmounts.length; i++) {
            const bonusInterest = (amount + earnedAmounts[i]) * dailyInterest;
            bonusInterestEarned.push(
                bonusInterestEarned[i - 1] + bonusInterest,
            );
        }

        return bonusInterestEarned;
    }
}
