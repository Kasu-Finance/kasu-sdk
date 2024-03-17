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
    DirectusSchema, PoolDelegateProfileAndHistoryDirectus,
    PoolOverviewDirectus,
    RiskManagementDirectus,
    RiskManagementItemDirectus,
} from './directus-types';
import { LendingPoolSubgraph, TrancheConfigurationSubgraph, TrancheSubgraph } from './subgraph-types';
import {
    PoolDelegateProfileAndHistory,
    PoolOverview,
    PoolTranches,
    RiskManagement,
    RiskManagementItem,
} from './types';

export class DataService {
    private readonly _graph: GraphQLClient;
    private readonly _directus: DirectusClient<DirectusSchema> & AuthenticationClient<DirectusSchema> & RestClient<DirectusSchema>;

    constructor(kasuConfig: SdkConfig) {
        this._graph = new GraphQLClient(kasuConfig.subgraphUrl);
        this._directus = createDirectus<DirectusSchema>('https://kasu-finance.directus.app').with(authentication()).with(rest());
    }
    async getPoolOverview(id_in: string): Promise<PoolOverview[]> {

        const subgraphResults: LendingPoolSubgraph[] = await this._graph.request(getAllLendingPoolsQuery);
        const directusResults: PoolOverviewDirectus[] = await this._directus.request(readItems('PoolOverview'));
        const retn: PoolOverview[] = [];
        for (const lendingPoolSubgraph of subgraphResults) {
            const lendingPoolDirectus = directusResults.find(r => r.id == lendingPoolSubgraph.id);
            if(!lendingPoolDirectus) {
                console.log("Couldn't find directus pool for id: ", lendingPoolSubgraph.id);
                continue;
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
                totalValueLocked: lendingPoolSubgraph.totalValueLocked,
                loansUnderManagement: lendingPoolSubgraph.loansUnderManagement,
                yieldEarned: lendingPoolSubgraph.yieldEarned,
                poolCapacity: lendingPoolSubgraph.poolCapacity,
                activeLoans: lendingPoolSubgraph.activeLoans,
                tranches: lendingPoolSubgraph.tranches
            }
            retn.push(poolOverview);
        }
        if(!id_in.length){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }

    async getRiskManagement(id_in: string[]): Promise<RiskManagement[]>{
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
        if(!id_in.length){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }

    async getPoolDelegateProfileAndHistory(id_in: string[]): Promise<PoolDelegateProfileAndHistory[]> {
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
        if(!id_in.length){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }

    async getPoolTranches(id_in: string[]): Promise<PoolTranches[]> {
        const subgraphResults: TrancheSubgraph[] = await this._graph.request(getAllTranchesQuery);
        const subgraphConfigurationResults: TrancheConfigurationSubgraph[] = await this._graph.request(getAllTrancheConfigurationsQuery);
        const retn: PoolTranches[] = [];

        if(!id_in.length){
            return retn;
        }
        return retn.filter(data => id_in.includes(data.id));
    }
}