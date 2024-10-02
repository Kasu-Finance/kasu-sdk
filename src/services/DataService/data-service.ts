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
    FinancialReportingDocumentsItemsDirectus,
    KeyCreditMetricsDirectus,
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
        return `${this._kasuConfig.directusUrl}assets/${fileName}`;
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
                this._directus.request(readItems('PoolRepayments')),
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
