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
import { filterArray } from '../shared';

import {
    BadAndDoubtfulDebtsDirectus,
    DirectusSchema,
    FinancialReportingDocumentsDirectus,
    PoolCreditMetricsDirectus,
    PoolDelegateProfileAndHistoryDirectus,
    PoolOverviewDirectus,
    PoolRepaymentDirectus,
    RiskManagementDirectus,
    RiskManagementItemDirectus,
} from './directus-types';
import {
    getAllLendingPoolConfigurationQuery,
    getAllLendingPoolsQuery,
    getAllTrancheConfigurationsQuery,
    getAllTranchesQuery,
    getLendingPoolWithdrawalAndDepositsQuery,
    getPoolNameQuery,
} from './queries';
import {
    LendingPoolConfigurationSubgraph,
    LendingPoolConfigurationSubgraphReturn,
    LendingPoolSubgraph,
    LendingPoolSubgraphReturn,
    LendingPoolWithdrawalAndDepositSubgraph,
    TrancheConfigurationSubgraph,
    TrancheSubgraph,
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
    RiskPerformance,
    TrancheData,
} from './types';

export class DataService {
    private readonly _graph: GraphQLClient;
    private readonly _directus: DirectusClient<DirectusSchema> &
        AuthenticationClient<DirectusSchema> &
        RestClient<DirectusSchema>;

    constructor(kasuConfig: SdkConfig) {
        this._graph = new GraphQLClient(kasuConfig.subgraphUrl);
        this._directus = createDirectus<DirectusSchema>(kasuConfig.directusUrl)
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

    async getPoolOverview(id_in?: string[]): Promise<PoolOverview[]> {
        const trancheNames: string[][] = [
            ['Senior'],
            ['Junior', 'Senior'],
            ['Junior', 'Mezzanine', 'Senior'],
        ];
        const subgraphTrancheConfigurationResults: TrancheConfigurationSubgraph =
            await this._graph.request(getAllTrancheConfigurationsQuery);
        const subgraphLendingPoolConfigurationResults: LendingPoolConfigurationSubgraphReturn =
            await this._graph.request(getAllLendingPoolConfigurationQuery);
        const subgraphResults: LendingPoolSubgraphReturn =
            await this._graph.request(getAllLendingPoolsQuery);
        const directusResults: PoolOverviewDirectus[] =
            await this._directus.request(readItems('PoolOverview'));
        const retn: PoolOverview[] = [];
        for (const lendingPoolSubgraph of subgraphResults.lendingPools) {
            const lendingPoolDirectus: PoolOverviewDirectus | undefined =
                directusResults.find(
                    (r) => r.id.toLowerCase() == lendingPoolSubgraph.id,
                );
            const lendingPoolConfig:
                | LendingPoolConfigurationSubgraph
                | undefined =
                subgraphLendingPoolConfigurationResults.lendingPoolConfigurations.find(
                    (r) => r.id == lendingPoolSubgraph.id,
                );
            if (!lendingPoolDirectus || !lendingPoolConfig) {
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
                    subgraphTrancheConfigurationResults.lendingPoolTrancheConfigurations.find(
                        (r) => r.id == tranche.id,
                    );
                if (!trancheConfig) {
                    console.warn(
                        "Couldn't find tranche config for id: ",
                        tranche.id,
                    );
                    continue;
                }
                tranches.push({
                    id: tranche.id,
                    apy: this.calculateApyForTranche(
                        trancheConfig.interestRate,
                    ).toString(),
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
            retn.push(poolOverview);
        }
        return filterArray(retn, id_in);
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
            await this._directus.request(
                readItems('PoolDelegateProfileAndHistory', {
                    fields: ['*', { otherPools: ['*'] }],
                }),
            );

        const poolNames: {
            lendingPools: Pick<LendingPoolSubgraph, 'name' | 'id'>[];
        } = await this._graph.request(getPoolNameQuery, {
            ids: poolDelegateProfileAndHistoryDirectus.flatMap((directus) =>
                directus.otherPools.map((delegate) => delegate.PoolOverview_id),
            ),
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

    async getPoolTranches(id_in?: string[]): Promise<PoolTranche[]> {
        const subgraphResults: TrancheSubgraphResult =
            await this._graph.request(getAllTranchesQuery);
        const subgraphConfigurationResults: TrancheConfigurationSubgraph =
            await this._graph.request(getAllTrancheConfigurationsQuery);
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
            const tranche: PoolTranche = {
                id: trancheSubgraph.id,
                poolIdFK: trancheSubgraph.lendingPool.id.toLowerCase(),
                apy: this.calculateApyForTranche(
                    configuration.interestRate,
                ).toString(),
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
        const badAndDoubtfulDebtsDirectus: BadAndDoubtfulDebtsDirectus[] =
            await this._directus.request(readItems('BadAndDoubtfulDebts'));
        return filterArray(badAndDoubtfulDebtsDirectus, id_in);
    }

    async getPoolCreditMetrics(id_in?: string[]): Promise<PoolCreditMetrics[]> {
        const poolCreditMetricsDirectus: PoolCreditMetricsDirectus[] =
            await this._directus.request(readItems('PoolCreditMetrics'));
        return filterArray(poolCreditMetricsDirectus, id_in);
    }

    async getFinancialReportingDocuments(
        id_in?: string[],
    ): Promise<FinancialReportingDocumentsDirectus[]> {
        const financialReportingDocumentsDirectus: FinancialReportingDocumentsDirectus[] =
            await this._directus.request(
                readItems('FinancialReportingDocuments'),
            );
        return filterArray(financialReportingDocumentsDirectus, id_in);
    }

    async getRepayments(id_in?: string[]): Promise<PoolRepayment[]> {
        const poolRepaymentDirectus: PoolRepaymentDirectus[] =
            await this._directus.request(readItems('PoolRepayments'));
        const lendingPoolsWithdrawalsAndDepositsSubgraph: LendingPoolWithdrawalAndDepositSubgraph =
            await this._graph.request(getLendingPoolWithdrawalAndDepositsQuery);
        const retn: PoolRepayment[] = [];
        for (const data of poolRepaymentDirectus) {
            const upcomingLendingFundsFlow_1_Value =
                data.upcomingLendingFundsFlow_1_Value &&
                data.upcomingLendingFundsFlow_1_Key
                    ? data.upcomingLendingFundsFlow_1_Value
                    : 0.0;
            const upcomingLendingFundsFlow_2_Value =
                data.upcomingLendingFundsFlow_2_Value &&
                data.upcomingLendingFundsFlow_2_Key
                    ? data.upcomingLendingFundsFlow_2_Value
                    : 0.0;
            const upcomingLendingFundsFlow_3_Value =
                data.upcomingLendingFundsFlow_3_Value &&
                data.upcomingLendingFundsFlow_3_Key
                    ? data.upcomingLendingFundsFlow_3_Value
                    : 0.0;
            const upcomingLendingFundsFlow_4_Value =
                data.upcomingLendingFundsFlow_4_Value &&
                data.upcomingLendingFundsFlow_4_Key
                    ? data.upcomingLendingFundsFlow_4_Value
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
            const depositAndWithdrawalRequests_CurrentDepositsRequests =
                lendingPoolSubgraph.pendingPool.totalPendingDepositsAmount;
            let sumTotalPendingWithdrawalShares = 0.0;
            lendingPoolSubgraph.pendingPool.totalPendingWithdrawalShares.forEach(
                (shares) => {
                    sumTotalPendingWithdrawalShares += parseFloat(shares);
                },
            );
            const poolRepayment: PoolRepayment = {
                id: data.id,
                poolIdFK: data.poolIdFK.toLowerCase(),
                currentTotalEndBorrowers: 0,
                cumulativeLendingFundsFlow_InterestAccrued:
                    data.cumulativeLendingFundsFlow_InterestAccrued,
                cumulativeLendingFundsFlow_InterestPayments:
                    data.cumulativeLendingFundsFlow_InterestPayments,
                cumulativeLendingFundsFlow_LoansDrawn:
                    data.cumulativeLendingFundsFlow_LoansDrawn,
                cumulativeLendingFundsFlow_OpeningLoansBalance:
                    data.cumulativeLendingFundsFlow_OpeningLoansBalance,
                cumulativeLendingFundsFlow_PrincipalRepayments:
                    data.cumulativeLendingFundsFlow_PrincipalRepayments,
                cumulativeLendingFundsFlow_UnrealisedLosses:
                    data.cumulativeLendingFundsFlow_UnrealisedLosses,
                upcomingLendingFundsFlow_1_Key:
                    data.upcomingLendingFundsFlow_1_Key ?? 'N/A',
                upcomingLendingFundsFlow_2_Key:
                    data.upcomingLendingFundsFlow_2_Key ?? 'N/A',
                upcomingLendingFundsFlow_3_Key:
                    data.upcomingLendingFundsFlow_3_Key ?? 'N/A',
                upcomingLendingFundsFlow_4_Key:
                    data.upcomingLendingFundsFlow_4_Key ?? 'N/A',
                upcomingLendingFundsFlow_1_Value:
                    upcomingLendingFundsFlow_1_Value,
                upcomingLendingFundsFlow_2_Value:
                    upcomingLendingFundsFlow_2_Value,
                upcomingLendingFundsFlow_3_Value:
                    upcomingLendingFundsFlow_3_Value,
                upcomingLendingFundsFlow_4_Value:
                    upcomingLendingFundsFlow_4_Value,
                cumulativeLendingFundsFlow_ClosingLoansBalance:
                    data.cumulativeLendingFundsFlow_InterestAccrued +
                    data.cumulativeLendingFundsFlow_InterestPayments +
                    data.cumulativeLendingFundsFlow_LoansDrawn +
                    data.cumulativeLendingFundsFlow_OpeningLoansBalance +
                    data.cumulativeLendingFundsFlow_PrincipalRepayments +
                    data.cumulativeLendingFundsFlow_UnrealisedLosses,
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
                    parseFloat(
                        depositAndWithdrawalRequests_CurrentDepositsRequests,
                    ) - sumTotalPendingWithdrawalShares,
                depositAndWithdrawalRequests_CurrentDepositsRequests:
                    parseFloat(
                        depositAndWithdrawalRequests_CurrentDepositsRequests,
                    ),
                depositAndWithdrawalRequests_CurrentWithdrawalRequests:
                    sumTotalPendingWithdrawalShares,
                repaymentsFileUrl: this.getUrlFromFile(data.repaymentsFile),
            };
            retn.push(poolRepayment);
        }
        return filterArray(retn, id_in);
    }

    async getLendingTotals(): Promise<LendingTotals> {
        const poolOverviews: PoolOverview[] = await this.getPoolOverview();
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

    calculateCompounding(amount: number, apy: number, time: number): number[] {
        const COMPOUNDING_PERIOD = 7;
        const helperCalculation: number[] = [amount];
        const dpy = apy / 365;

        const initialAmount = amount;

        let compoundingAmount = amount;

        const earnedAmount = [0];
        for (let i = 0; i < time; i++) {
            helperCalculation.push(
                helperCalculation[helperCalculation.length - 1] + amount * dpy,
            );

            earnedAmount.push(
                earnedAmount[earnedAmount.length - 1] + compoundingAmount * dpy,
            );

            if (i % COMPOUNDING_PERIOD === 0) {
                amount = helperCalculation[helperCalculation.length - 1];

                compoundingAmount =
                    initialAmount + earnedAmount[earnedAmount.length - 1];
            }
        }

        return earnedAmount;
    }
}
