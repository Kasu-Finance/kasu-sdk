import {
    authentication,
    AuthenticationClient,
    createDirectus,
    DirectusClient,
    readItems,
    rest,
    RestClient,
} from '@directus/sdk';
import { GraphQLClient } from 'graphql-request';

import { SdkConfig } from '../../sdk-config';
import { getSystemVariablesQuery } from '../Locking/queries';
import { SystemVariables } from '../Locking/types';
import { filterArray } from '../shared';

import {
    BadAndDoubtfulDebtsItems,
    DirectusSchema,
    FinancialReportingDocumentsDirectus,
    KeyCreditMetricsDirectus,
    PoolDelegateProfileAndHistoryDirectus,
    PoolOverviewDirectus,
    PoolRepaymentDirectus,
    RiskManagementDirectus,
    RiskManagementItemDirectus,
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
    BadAndDoubtfulDebts,
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

export class DataService {
    private readonly _graph: GraphQLClient;
    private readonly _directus: DirectusClient<DirectusSchema> &
        AuthenticationClient<DirectusSchema> &
        RestClient<DirectusSchema>;
    private _directusPoolOverview: PoolOverviewDirectus[] | undefined;

    constructor(private _kasuConfig: SdkConfig) {
        this._graph = new GraphQLClient(_kasuConfig.subgraphUrl);
        this._directus = createDirectus<DirectusSchema>(_kasuConfig.directusUrl)
            .with(authentication())
            .with(rest());
    }

    private getUrlFromFile(fileName: string): string {
        return `https://kasu-finance.directus.app/assets/${fileName}`;
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
        if (index == lendingPoolConfig.tranchesConfig.length - 1) {
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

    calculateApyForTranche(interestRate: string): number {
        const EPOCHS_IN_YEAR = 52.17857;
        return (1 + parseFloat(interestRate)) ** EPOCHS_IN_YEAR - 1;
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
            this._directusPoolOverview = await this._directus.request(
                readItems('PoolOverview', {
                    filter: {
                        enabled: {
                            _eq: true,
                        },
                    },
                }),
            );
        }

        const retn: PoolOverview[] = [];
        for (const lendingPoolSubgraph of poolOverviewResults.lendingPools) {
            const lendingPoolDirectus: PoolOverviewDirectus | undefined =
                this._directusPoolOverview.find(
                    (r) => r.id.toLowerCase() == lendingPoolSubgraph.id,
                );

            const lendingPoolConfig = lendingPoolSubgraph.configuration;

            if (!lendingPoolDirectus) {
                console.warn(
                    "Couldn't find directus pool for id: ",
                    lendingPoolSubgraph.id,
                );
                continue;
            }
            const poolCapacities = this.calculatePoolCapacity(
                [],
                [],
                0,
                0,
                lendingPoolSubgraph,
                lendingPoolConfig,
            );
            const tranches: TrancheData[] = [];
            for (const tranche of lendingPoolSubgraph.tranches) {
                const trancheConfig =
                    lendingPoolSubgraph.configuration.tranchesConfig.find(
                        (r) => r.id == tranche.id,
                    );
                if (!trancheConfig) {
                    console.warn(
                        "Couldn't find tranche config for id: ",
                        tranche.id,
                    );
                    continue;
                }

                const interestUpdates =
                    trancheConfig.lendingPoolTrancheInterestRateUpdates;

                const interestRate = interestUpdates.length
                    ? interestUpdates[0].epochInterestRate
                    : trancheConfig.interestRate;

                tranches.push({
                    id: tranche.id,
                    apy: this.calculateApyForTranche(interestRate).toString(),
                    interestRate,
                    maximumDeposit: trancheConfig.maxDepositAmount,
                    minimumDeposit: trancheConfig.minDepositAmount,
                    poolCapacityPercentage:
                        poolCapacities.poolCapacityPercentage[
                            lendingPoolSubgraph.tranches.indexOf(tranche)
                        ].toString(),
                    poolCapacity:
                        poolCapacities.poolCapacity[
                            lendingPoolSubgraph.tranches.indexOf(tranche)
                        ].toString(),
                    name: trancheNames[lendingPoolSubgraph.tranches.length - 1][
                        parseInt(tranche.orderId)
                    ],
                });
            }
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
                averageApy += parseFloat(trancheData.apy) * weight;
            }
            const poolOverview: PoolOverview = {
                id: lendingPoolSubgraph.id,
                security: lendingPoolDirectus.security,
                enabled: lendingPoolDirectus.enabled,
                apy: averageApy,
                poolAddress: lendingPoolSubgraph.id,
                description: lendingPoolDirectus.description,
                bannerImageUrl: this.getUrlFromFile(
                    lendingPoolDirectus.bannerImage,
                ),
                thumbnailImageUrl: this.getUrlFromFile(
                    lendingPoolDirectus.thumbnailImage,
                ),
                strategyDeckUrl: this.getUrlFromFile(
                    lendingPoolDirectus.strategyDeck,
                ),
                assetClass: lendingPoolDirectus.assetClass,
                industryExposure: lendingPoolDirectus.industryExposure,
                poolApyStructure: lendingPoolDirectus.poolApyStructure,
                apyExpiryDate: lendingPoolDirectus.apyExpiryDate,
                poolInvestmentTerm: lendingPoolDirectus.poolInvestmentTerm,
                loanStructure: lendingPoolDirectus.loanStructure,
                poolName: lendingPoolSubgraph.name,
                totalValueLocked: lendingPoolSubgraph.balance,
                loansUnderManagement: lendingPoolDirectus.loansUnderManagement,
                yieldEarned: lendingPoolSubgraph.totalUserInterestAmount,
                poolCapacity: poolCapacitySum.toString(),
                poolCapacityPercentage: poolCapacityPercentageSum.toString(),
                activeLoans: lendingPoolDirectus.activeLoans,
                loanFundsOriginated: lendingPoolDirectus.loanFundsOriginated,
                tranches: tranches,
                isActive: !lendingPoolSubgraph.isStopped,
            };

            // show only enabled pools from cms
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
        const resultDirectusRiskManagement: RiskManagementDirectus[] =
            await this._directus.request(readItems('RiskManagement'));
        const resultDirectusRiskManagementItem: RiskManagementItemDirectus[] =
            await this._directus.request(readItems('RiskManagementItems'));
        const retn: RiskManagement[] = [];
        for (const riskManagementDirectus of resultDirectusRiskManagement) {
            const items = resultDirectusRiskManagementItem.filter(
                (r) => r.riskManagementFK == riskManagementDirectus.id,
            );
            const itemsList: RiskManagementItem[] = items.sort(
                (a, b) => a.priority - b.priority,
            );
            retn.push({
                id: riskManagementDirectus.id,
                poolIdFK: riskManagementDirectus.poolIdFK.toLowerCase(),
                items: itemsList,
                riskPerformance: {
                    id: riskManagementDirectus.id,
                    firstLossCapital: riskManagementDirectus.firstLossCapital,
                    poolLossRate: riskManagementDirectus.poolLossRate,
                    independentRiskScore:
                        riskManagementDirectus.independentRiskScore,
                    communityRating: riskManagementDirectus.communityRating,
                },
            });
        }
        return filterArray(retn, id_in);
    }

    async getPoolDelegateProfileAndHistory(
        id_in?: string[],
    ): Promise<PoolDelegateProfileAndHistory[]> {
        const poolDelegateProfileAndHistoryDirectus: PoolDelegateProfileAndHistoryDirectus[] =
            (await this._directus.request(
                readItems('PoolDelegateProfileAndHistory', {
                    // @ts-ignore:next-line
                    fields: ['*', { otherPools: ['*'] }],
                }),
            )) as unknown as PoolDelegateProfileAndHistoryDirectus[];

        const poolNames: {
            lendingPools: Pick<LendingPoolSubgraph, 'name' | 'id'>[];
        } = await this._graph.request(getPoolNameQuery, {
            ids: poolDelegateProfileAndHistoryDirectus.flatMap((directus) =>
                directus.otherPools.map((delegate) => delegate.PoolOverview_id),
            ),
            unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS,
        });

        const retn: PoolDelegateProfileAndHistory[] = [];
        for (const data of poolDelegateProfileAndHistoryDirectus) {
            retn.push({
                id: data.id,
                poolIdFK: data.poolIdFK.toLowerCase(),
                delegateLendingHistory: data.delegateLendingHistory,
                assetClasses: data.assetClasses,
                otherKASUPools: data.otherPools.map((pool) => ({
                    id: pool.PoolOverview_id,
                    name:
                        poolNames.lendingPools.find(
                            ({ id }) => pool.PoolOverview_id === id,
                        )?.name ?? pool.PoolOverview_id,
                })),
                totalLoanFundsOriginated: data.totalLoanFundsOriginated,
                totalLoansOriginated: data.totalLoansOriginated,
                loansUnderManagement: data.loansUnderManagement,
                historicLossRate: data.historicLossRate,
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
            Record<number, KeyCreditMetricsDirectus>
        > = keyCreditMetricsDirectus.reduce(
            (acc, cur) => ({ ...acc, [cur.id]: cur }),
            {},
        );

        const poolCreditMetrics = poolCreditMetricsDirectus
            .map((pool) => {
                if (!pool.keyCreditMetrics) return null;

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
            })
            .filter((pool) => pool !== null);

        return filterArray(poolCreditMetrics, id_in);
    }

    async getFinancialReportingDocuments(
        id_in?: string[],
    ): Promise<FinancialReportingDocumentsDirectus[]> {
        const financialReportingDocumentsDirectus: FinancialReportingDocumentsDirectus[] =
            await this._directus.request(
                readItems(
                    'FinancialReportingDocuments',
                    // @ts-ignore:next-line
                    { fields: ['*', { documents: ['*'] }] },
                ),
            );

        const mapDocumentFilePath = financialReportingDocumentsDirectus.map(
            (report) => ({
                ...report,
                documents: report.documents.map((document) => ({
                    ...document,
                    document: this.getUrlFromFile(document.document),
                })),
            }),
        );

        return filterArray(mapDocumentFilePath, id_in);
    }

    async getRepayments(id_in?: string[]): Promise<PoolRepayment[]> {
        const poolRepaymentDirectus: PoolRepaymentDirectus[] =
            await this._directus.request(readItems('PoolRepayments'));
        const lendingPoolsWithdrawalsAndDepositsSubgraph: LendingPoolWithdrawalAndDepositSubgraph =
            await this._graph.request(
                getLendingPoolWithdrawalAndDepositsQuery,
                { unusedPools: this._kasuConfig.UNUSED_LENDING_POOL_IDS },
            );
        const retn: PoolRepayment[] = [];
        for (const data of poolRepaymentDirectus) {
            const upcomingLendingFundsFlow_1_Value =
                data.UpcomingLendingFundsFlow_1_Value &&
                data.UpcomingLendingFundsFlow_1_Key
                    ? data.UpcomingLendingFundsFlow_1_Value
                    : 0.0;
            const upcomingLendingFundsFlow_2_Value =
                data.UpcomingLendingFundsFlow_2_Value &&
                data.UpcomingLendingFundsFlow_2_Key
                    ? data.UpcomingLendingFundsFlow_2_Value
                    : 0.0;
            const upcomingLendingFundsFlow_3_Value =
                data.UpcomingLendingFundsFlow_3_Value &&
                data.UpcomingLendingFundsFlow_3_Key
                    ? data.UpcomingLendingFundsFlow_3_Value
                    : 0.0;
            const upcomingLendingFundsFlow_4_Value =
                data.UpcomingLendingFundsFlow_4_Value &&
                data.UpcomingLendingFundsFlow_4_Key
                    ? data.UpcomingLendingFundsFlow_4_Value
                    : 0.0;

            const lendingPoolSubgraph =
                lendingPoolsWithdrawalsAndDepositsSubgraph.lendingPools.find(
                    (pool) => pool.id == data.poolIdFK,
                );

            if (lendingPoolSubgraph === undefined) {
                console.error(
                    "Couldn't find lending pool for id: ",
                    data.poolIdFK,
                );
                continue;
            }
            const cumulativeDepositsAndWithdrawals_CumulativeWithdrawals =
                lendingPoolSubgraph.totalWithdrawalsAccepted;
            const cumulativeDepositsAndWithdrawals_CumulativeDeposits =
                lendingPoolSubgraph.totalDepositsAccepted;
            const currentDepositRequests = parseFloat(
                lendingPoolSubgraph.pendingPool.totalPendingDepositsAmount,
            );

            let sumTotalPendingWithdrawalShares = 0.0;

            lendingPoolSubgraph.pendingPool.totalPendingWithdrawalShares.forEach(
                (shares) => {
                    sumTotalPendingWithdrawalShares += parseFloat(shares);
                },
            );

            const totalUpcomingFunds = {
                label: 'Net Inflows/(Outflows)',
                value: 0,
            };

            const totalCumulativeFunds = {
                label: 'Closing Loans Balance',
                value: 0,
            };

            if (data.UpcomingLendingFundsFlow) {
                totalUpcomingFunds.value = data.UpcomingLendingFundsFlow.reduce(
                    (total, cur) => (total += cur.value),
                    0,
                );
            }

            if (data.CumulativeLendingFundsFlow) {
                totalCumulativeFunds.value =
                    data.CumulativeLendingFundsFlow.reduce(
                        (total, cur) => (total += cur.value),
                        0,
                    );
            }

            const poolRepayment: PoolRepayment = {
                id: data.id,
                poolIdFK: data.poolIdFK.toLowerCase(),
                currentTotalEndBorrowers: 0,
                cumulativeLendingFundsFlow_InterestAccrued:
                    data.CumulativeLendingFundsFlow_InterestAccrued,
                cumulativeLendingFundsFlow_InterestPayments:
                    data.CumulativeLendingFundsFlow_InterestPayments,
                cumulativeLendingFundsFlow_LoansDrawn:
                    data.CumulativeLendingFundsFlow_LoansDrawn,
                cumulativeLendingFundsFlow_OpeningLoansBalance:
                    data.CumulativeLendingFundsFlow_OpeningLoansBalance,
                cumulativeLendingFundsFlow_PrincipalRepayments:
                    data.CumulativeLendingFundsFlow_PrincipalRepayments,
                cumulativeLendingFundsFlow_UnrealisedLosses:
                    data.CumulativeLendingFundsFlow_UnrealisedLosses,
                upcomingLendingFundsFlow_1_Key:
                    data.UpcomingLendingFundsFlow_1_Key,
                upcomingLendingFundsFlow_2_Key:
                    data.UpcomingLendingFundsFlow_2_Key,
                upcomingLendingFundsFlow_3_Key:
                    data.UpcomingLendingFundsFlow_3_Key,
                upcomingLendingFundsFlow_4_Key:
                    data.UpcomingLendingFundsFlow_4_Key,
                upcomingLendingFundsFlow_1_Value:
                    upcomingLendingFundsFlow_1_Value,
                upcomingLendingFundsFlow_2_Value:
                    upcomingLendingFundsFlow_2_Value,
                upcomingLendingFundsFlow_3_Value:
                    upcomingLendingFundsFlow_3_Value,
                upcomingLendingFundsFlow_4_Value:
                    upcomingLendingFundsFlow_4_Value,
                cumulativeLendingFundsFlow_ClosingLoansBalance:
                    data.CumulativeLendingFundsFlow_InterestAccrued +
                    data.CumulativeLendingFundsFlow_InterestPayments +
                    data.CumulativeLendingFundsFlow_LoansDrawn +
                    data.CumulativeLendingFundsFlow_OpeningLoansBalance +
                    data.CumulativeLendingFundsFlow_PrincipalRepayments +
                    data.CumulativeLendingFundsFlow_UnrealisedLosses,
                upcomingLendingFundsFlow_NetInflows:
                    upcomingLendingFundsFlow_1_Value +
                    upcomingLendingFundsFlow_2_Value +
                    upcomingLendingFundsFlow_3_Value +
                    upcomingLendingFundsFlow_4_Value,
                cumulativeDepositsAndWithdrawals_NetDeposits:
                    parseFloat(
                        cumulativeDepositsAndWithdrawals_CumulativeDeposits,
                    ) -
                    parseFloat(
                        cumulativeDepositsAndWithdrawals_CumulativeWithdrawals,
                    ),
                cumulativeDepositsAndWithdrawals_CumulativeWithdrawals:
                    parseFloat(
                        cumulativeDepositsAndWithdrawals_CumulativeWithdrawals,
                    ),
                cumulativeDepositsAndWithdrawals_CumulativeDeposits: parseFloat(
                    cumulativeDepositsAndWithdrawals_CumulativeDeposits,
                ),
                depositAndWithdrawalRequests_NetDeposits:
                    currentDepositRequests - sumTotalPendingWithdrawalShares,
                depositAndWithdrawalRequests_CurrentDepositsRequests:
                    currentDepositRequests,
                depositAndWithdrawalRequests_CurrentWithdrawalRequests:
                    sumTotalPendingWithdrawalShares,
                repaymentsFileUrl: this.getUrlFromFile(data.repaymentsFile),
                upcomingLendingFundsFlow: data.UpcomingLendingFundsFlow
                    ? [totalUpcomingFunds, ...data.UpcomingLendingFundsFlow]
                    : [totalUpcomingFunds],
                cumulativeLendingFundsFlow: data.CumulativeLendingFundsFlow
                    ? [totalCumulativeFunds, ...data.CumulativeLendingFundsFlow]
                    : [totalCumulativeFunds],
                cumulativeLendingAndWithdrawals: [
                    {
                        label: 'Net Lending/(Lending Withdrawals)',
                        value:
                            parseFloat(
                                lendingPoolSubgraph.totalDepositsAccepted,
                            ) -
                            parseFloat(
                                lendingPoolSubgraph.totalWithdrawalsAccepted,
                            ),
                    },
                    {
                        label: 'Cumulative Lending',
                        value: parseFloat(
                            lendingPoolSubgraph.totalDepositsAccepted,
                        ),
                    },
                    {
                        label: 'Cumulative Lending Withdrawals',
                        value: parseFloat(
                            lendingPoolSubgraph.totalWithdrawalsAccepted,
                        ),
                    },
                ],
                lendingAndWithdrawalRequests: [
                    {
                        label: 'Net Lending/(Withdrawal Requests)',
                        value:
                            currentDepositRequests -
                            sumTotalPendingWithdrawalShares,
                    },
                    {
                        label: 'Current Lending Requests',
                        value: currentDepositRequests,
                    },
                    {
                        label: 'Current Lending Withdrawal Requests',
                        value: sumTotalPendingWithdrawalShares,
                    },
                ],
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
            retn.totalValueLocked += parseFloat(poolOverview.totalValueLocked);
            retn.loansUnderManagement += parseFloat(
                poolOverview.loansUnderManagement,
            );
            retn.totalLoanFundsOriginated += parseFloat(
                poolOverview.loanFundsOriginated,
            );
            retn.totalYieldEarned += parseFloat(poolOverview.yieldEarned);
        }
        for (const poolOverview of poolOverviews) {
            const riskManagement = riskManagements.find(
                (rm) =>
                    rm.poolIdFK.toLowerCase() === poolOverview.id.toLowerCase(),
            );
            if (!riskManagement) {
                console.warn(
                    "Couldn't find risk management for id: ",
                    poolOverview.id,
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
