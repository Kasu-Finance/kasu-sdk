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
    PoolOverviewDirectus,
    RiskManagementDirectus,
    RiskManagementItemDirectus,
} from './directus-types';
import { LendingPoolSubgraph, TrancheConfigurationSubgraph, TrancheSubgraph } from './subgraph-types';
import {
    BadAndDoubtfulDebts, PoolCreditMetrics,
    PoolDelegateProfileAndHistory,
    PoolOverview, PoolTranche,
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
        const subgraphTrancheConfigurationResults: TrancheConfigurationSubgraph[] = await this._graph.request(getAllTrancheConfigurationsQuery);
        const subgraphResults: LendingPoolSubgraph[] = await this._graph.request(getAllLendingPoolsQuery);
        const directusResults: PoolOverviewDirectus[] = await this._directus.request(readItems('PoolOverview'));
        const retn: PoolOverview[] = [];
        for (const lendingPoolSubgraph of subgraphResults) {
            const lendingPoolDirectus = directusResults.find(r => r.id == lendingPoolSubgraph.id);
            const tranches: TrancheData[] = [];
            if(!lendingPoolDirectus) {
                console.log("Couldn't find directus pool for id: ", lendingPoolSubgraph.id);
                continue;
            }
            for (const tranche of lendingPoolSubgraph.tranches) {
                const trancheConfig = subgraphTrancheConfigurationResults.find(r => r.id == tranche.id);
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
                    name: (trancheNames[tranches.length-1][tranche.orderId] || "N/A") as string,
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
        const resultDirectusRiskManagement: RiskManagementDirectus[] = await this._directus.request(readItems('riskManagement'));
        const resultDirectusRiskManagementItem: RiskManagementItemDirectus[] = await this._directus.request(readItems('riskManagementItem'));
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
        const poolDelegateProfileAndHistoryDirectus: PoolDelegateProfileAndHistoryDirectus[] = await this._directus.request(readItems('poolDelegateProfileAndHistory'));
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
        const subgraphConfigurationResults: TrancheConfigurationSubgraph[] = await this._graph.request(getAllTrancheConfigurationsQuery);
        const retn: PoolTranche[] = [];
        for (const trancheSubgraph of subgraphResults) {
            const configuration = subgraphConfigurationResults.find(r => r.id == trancheSubgraph.id);
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
        const badAndDoubtfulDebtsDirectus: BadAndDoubtfulDebtsDirectus[] = await this._directus.request(readItems('badAndDoubtfulDebts'));
        if(!id_in){
            return badAndDoubtfulDebtsDirectus;
        }
        return badAndDoubtfulDebtsDirectus.filter(data => id_in.includes(data.id));
    }

    async getPoolCreditMetrics(id_in?: string[]): Promise<PoolCreditMetrics[]> {
        const poolCreditMetricsDirectus: PoolCreditMetricsDirectus[] = await this._directus.request(readItems('poolCreditMetrics'));
        if(!id_in){
            return poolCreditMetricsDirectus;
        }
        return poolCreditMetricsDirectus.filter(data => id_in.includes(data.id));
    }

    async getFinancialReportingDocuments(id_in?: string[]): Promise<FinancialReportingDocumentsDirectus[]> {
        const financialReportingDocumentsDirectus: FinancialReportingDocumentsDirectus[] = await this._directus.request(readItems('financialReportingDocuments'));
        if(!id_in){
            return financialReportingDocumentsDirectus;
        }
        return financialReportingDocumentsDirectus.filter(data => id_in.includes(data.id));
    }
}