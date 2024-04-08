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

import { getAllLendingPoolsQuery, getAllTrancheConfigurationsQuery, getAllTranchesQuery } from './data-service.query';
import {
    BadAndDoubtfulDebtsDirectus,
    DirectusSchema,
    FinancialReportingDocumentsDirectus,
    PoolCreditMetricsDirectus,
    PoolDelegateProfileAndHistoryDirectus,
    PoolOverviewDirectus, PoolRepaymentDirectus,
    RiskManagementDirectus,
    RiskManagementItemDirectus,
} from './directus-types';
import { LendingPoolSubgraph, TrancheConfigurationSubgraph, TrancheSubgraph } from './subgraph-types';
import {
    BadAndDoubtfulDebts, PoolCreditMetrics,
    PoolDelegateProfileAndHistory,
    PoolOverview, PoolRepayment, PoolTranche,
    RiskManagement,
    RiskManagementItem, TrancheData,
} from './types';


export class DataService {
    private readonly _graph: GraphQLClient;
    private readonly _directus: DirectusClient<DirectusSchema> & AuthenticationClient<DirectusSchema> & RestClient<DirectusSchema>;

    constructor(kasuConfig: SdkConfig) {
        this._graph = new GraphQLClient(kasuConfig.subgraphUrl);
        this._directus = createDirectus<DirectusSchema>(kasuConfig.directusUrl).with(authentication()).with(rest());
    }
    async getPoolOverview(id_in?: string[]): Promise<PoolOverview[]> {
        const trancheNames: string[][] = [["Senior"], ["Junior", "Senior"], ["Junior", "Mezzanine", "Senior"]];
        const subgraphTrancheConfigurationResults: TrancheConfigurationSubgraph = await this._graph.request(getAllTrancheConfigurationsQuery);
        const subgraphResults: LendingPoolSubgraph = await this._graph.request(getAllLendingPoolsQuery);
        const directusResults: PoolOverviewDirectus[] = await this._directus.request(readItems('PoolOverview'));
        const retn: PoolOverview[] = [];
        for (const lendingPoolSubgraph of subgraphResults.lendingPools) {
            const lendingPoolDirectus = directusResults.find(r => r.id == lendingPoolSubgraph.id);
            const tranches: TrancheData[] = [];
            if(!lendingPoolDirectus) {
                console.log("Couldn't find directus pool for id: ", lendingPoolSubgraph.id);
                continue;
            }
            for (const tranche of lendingPoolSubgraph.tranches) {
                const trancheConfig = subgraphTrancheConfigurationResults.lendingPoolTrancheConfigurations.find(r => r.id == tranche.id);
                if(!trancheConfig) {
                    console.log("Couldn't find tranche config for id: ", tranche.id);
                    continue;
                }
                tranches.push({
                    id: tranche.id,
                    apy: trancheConfig.interestRate,
                    maximumDeposit: trancheConfig.maxDepositAmount,
                    minimumDeposit: trancheConfig.minDepositAmount,
                    poolCapacity: "10", // need formula for calculation
                    name: trancheNames[lendingPoolSubgraph.tranches.length-1][parseInt(tranche.orderId)]
                });
            }
            const poolOverview: PoolOverview = {
                id: lendingPoolSubgraph.id,
                apy: lendingPoolDirectus.apy,
                poolAddress: lendingPoolSubgraph.id,
                description: lendingPoolDirectus.description,
                bannerImageUrl: lendingPoolDirectus.bannerImageUrl,
                thumbnailImageUrl: lendingPoolDirectus.thumbnailImageUrl,
                strategyDeckUrl: lendingPoolDirectus.strategyDeckUrl,
                assetClass: lendingPoolDirectus.assetClass,
                industryExposure: lendingPoolDirectus.industryExposure,
                poolApyStructure: lendingPoolDirectus.poolApyStructure,
                poolInvestmentTerm: lendingPoolDirectus.poolInvestmentTerm,
                loanStructure: lendingPoolDirectus.loanStructure,
                poolName: lendingPoolSubgraph.name,
                totalValueLocked: lendingPoolSubgraph.balance,
                loansUnderManagement: lendingPoolDirectus.loansUnderManagement,
                yieldEarned: lendingPoolSubgraph.totalYieldAmount,
                poolCapacity: "placeholder", // need formula for calculation
                activeLoans: lendingPoolDirectus.activeLoans,
                tranches: tranches,
            }
            retn.push(poolOverview);
        }
        if(!id_in){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }

    async getRiskManagement(id_in?: string[]): Promise<RiskManagement[]>{
        const resultDirectusRiskManagement: RiskManagementDirectus[] = await this._directus.request(readItems('RiskManagement'));
        const resultDirectusRiskManagementItem: RiskManagementItemDirectus[] = await this._directus.request(readItems('RiskManagementItems'));
        const retn: RiskManagement[] = [];
        for(const riskManagementDirectus of resultDirectusRiskManagement){
            const items = resultDirectusRiskManagementItem.filter(r => r.fkRiskManagement == riskManagementDirectus.id);
            const itemsList: RiskManagementItem[] = items.sort((a, b) => a.priority - b.priority);
            retn.push({
                id: riskManagementDirectus.id,
                poolIdFK: riskManagementDirectus.poolIdFK,
                items: itemsList,
                riskPerformance: {
                    id: riskManagementDirectus.id,
                    firstLossCapital: riskManagementDirectus.firstLossCapital,
                    poolLossRate: riskManagementDirectus.poolLossRate,
                    independentRiskScore: riskManagementDirectus.independentRiskScore,
                    communityRating: riskManagementDirectus.communityRating
                },
            });
        }
        if(!id_in){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }

    async getPoolDelegateProfileAndHistory(id_in?: string[]): Promise<PoolDelegateProfileAndHistory[]> {
        const poolDelegateProfileAndHistoryDirectus: PoolDelegateProfileAndHistoryDirectus[] = await this._directus.request(readItems('PoolDelegateProfileAndHistory'));
        const retn: PoolDelegateProfileAndHistory[] = [];
        for(const data of poolDelegateProfileAndHistoryDirectus){
            retn.push({
                id: data.id,
                poolIdFK: data.poolIdFK,
                delegateLendingHistory: data.delegateLendingHistory,
                assetClasses: data.assetClasses,
                otherKASUPools: data.otherKASUPools.split(","),
                totalLoanFundsOriginated: data.totalLoanFundsOriginated,
                totalLoansOriginated: data.totalLoansOriginated,
                loansUnderManagement: data.loansUnderManagement,
                historicLossRate: data.historicLossRate
            });
        }
        if(!id_in){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }

    async getPoolTranches(id_in?: string[]): Promise<PoolTranche[]> {
        const subgraphResults: TrancheSubgraph[] = await this._graph.request(getAllTranchesQuery);
        const subgraphConfigurationResults: TrancheConfigurationSubgraph = await this._graph.request(getAllTrancheConfigurationsQuery);
        const retn: PoolTranche[] = [];
        for (const trancheSubgraph of subgraphResults) {
            const configuration = subgraphConfigurationResults.lendingPoolTrancheConfigurations.find(r => r.id == trancheSubgraph.id);
            if(!configuration) {
                console.log("Couldn't find tranche configuration for id: ", trancheSubgraph.id);
                continue;
            }

            const tranche: PoolTranche = {
                id: trancheSubgraph.id,
                poolIdFK: trancheSubgraph.lendingPool.id,
                apy: configuration.interestRate,
                remainingCapacity: "10", // need formula for calculation
                minimalDepositThreshold: configuration.minDepositAmount,
                maximalDepositThreshold: configuration.maxDepositAmount
            }
        }

        if(!id_in){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }

    async getBadAndDoubtfulDebts(id_in?: string[]): Promise<BadAndDoubtfulDebts[]> {
        const badAndDoubtfulDebtsDirectus: BadAndDoubtfulDebtsDirectus[] = await this._directus.request(readItems('BadAndDoubtfulDebts'));
        if(!id_in){
            return badAndDoubtfulDebtsDirectus;
        }
        return badAndDoubtfulDebtsDirectus.filter(data => id_in.includes(data.id));
    }

    async getPoolCreditMetrics(id_in?: string[]): Promise<PoolCreditMetrics[]> {
        const poolCreditMetricsDirectus: PoolCreditMetricsDirectus[] = await this._directus.request(readItems('PoolCreditMetrics'));
        if(!id_in){
            return poolCreditMetricsDirectus;
        }
        return poolCreditMetricsDirectus.filter(data => id_in.includes(data.id));
    }

    async getFinancialReportingDocuments(id_in?: string[]): Promise<FinancialReportingDocumentsDirectus[]> {
        const financialReportingDocumentsDirectus: FinancialReportingDocumentsDirectus[] = await this._directus.request(readItems('FinancialReportingDocuments'));
        if(!id_in){
            return financialReportingDocumentsDirectus;
        }
        return financialReportingDocumentsDirectus.filter(data => id_in.includes(data.id));
    }

    async getRepayments(id_in?: string): Promise<PoolRepayment[]>{
        const poolRepaymentDirectus: PoolRepaymentDirectus[] = await this._directus.request(readItems('PoolRepayments'));
        const retn: PoolRepayment[] = [];
        for(const data of poolRepaymentDirectus){
            const upcomingLendingFundsFlow_1_Value = data.upcomingLendingFundsFlow_1_Value && data.upcomingLendingFundsFlow_1_Key ? data.upcomingLendingFundsFlow_1_Value : 0.00;
            const upcomingLendingFundsFlow_2_Value = data.upcomingLendingFundsFlow_2_Value && data.upcomingLendingFundsFlow_2_Key ? data.upcomingLendingFundsFlow_2_Value : 0.00;
            const upcomingLendingFundsFlow_3_Value = data.upcomingLendingFundsFlow_3_Value && data.upcomingLendingFundsFlow_3_Key ? data.upcomingLendingFundsFlow_3_Value : 0.00;
            const upcomingLendingFundsFlow_4_Value = data.upcomingLendingFundsFlow_4_Value && data.upcomingLendingFundsFlow_4_Key ? data.upcomingLendingFundsFlow_4_Value : 0.00;
            const poolRepayment: PoolRepayment = {
                id: data.id,
                poolIdFK: data.poolIdFK,
                cumulativeLendingFundsFlow_InterestAccrued: data.cumulativeLendingFundsFlow_InterestAccrued,
                cumulativeLendingFundsFlow_InterestPayments: data.cumulativeLendingFundsFlow_InterestPayments,
                cumulativeLendingFundsFlow_LoansDrawn: data.cumulativeLendingFundsFlow_LoansDrawn,
                cumulativeLendingFundsFlow_OpeningLoansBalance: data.cumulativeLendingFundsFlow_OpeningLoansBalance,
                cumulativeLendingFundsFlow_PrincipalRepayments: data.cumulativeLendingFundsFlow_PrincipalRepayments,
                cumulativeLendingFundsFlow_UnrealisedLosses: data.cumulativeLendingFundsFlow_UnrealisedLosses,
                upcomingLendingFundsFlow_1_Key: data.upcomingLendingFundsFlow_1_Key ?? "N/A",
                upcomingLendingFundsFlow_2_Key: data.upcomingLendingFundsFlow_2_Key ?? "N/A",
                upcomingLendingFundsFlow_3_Key: data.upcomingLendingFundsFlow_3_Key ?? "N/A",
                upcomingLendingFundsFlow_4_Key: data.upcomingLendingFundsFlow_4_Key ?? "N/A",
                upcomingLendingFundsFlow_1_Value: upcomingLendingFundsFlow_1_Value,
                upcomingLendingFundsFlow_2_Value: upcomingLendingFundsFlow_2_Value,
                upcomingLendingFundsFlow_3_Value: upcomingLendingFundsFlow_3_Value,
                upcomingLendingFundsFlow_4_Value: upcomingLendingFundsFlow_4_Value,
                cumulativeLendingFundsFlow_ClosingLoansBalance: data.cumulativeLendingFundsFlow_InterestAccrued + data.cumulativeLendingFundsFlow_InterestPayments + data.cumulativeLendingFundsFlow_LoansDrawn + data.cumulativeLendingFundsFlow_OpeningLoansBalance + data.cumulativeLendingFundsFlow_PrincipalRepayments + data.cumulativeLendingFundsFlow_UnrealisedLosses,
                upcomingLendingFundsFlow_NetInflows: upcomingLendingFundsFlow_1_Value + upcomingLendingFundsFlow_2_Value + upcomingLendingFundsFlow_3_Value + upcomingLendingFundsFlow_4_Value,
            };
            retn.push(poolRepayment);
        }
        if(!id_in){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }
}