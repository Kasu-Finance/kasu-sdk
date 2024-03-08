import { GraphQLClient } from 'graphql-request';

import { SdkConfig } from '../../sdk-config';
import {
    PoolDelegateProfileAndHistory, PoolOverview, PoolTranches,
    RiskManagement, RiskPerformance, TrancheData
} from '../../types';

export class DataService {
    private readonly _graph: GraphQLClient;

    constructor(kasuConfig: SdkConfig) {
        this._graph = new GraphQLClient(kasuConfig.subgraphUrl);
    }

    getPoolOverview(id_in: string): PoolOverview[] {
        const fakeData: PoolOverview[] = [
            {
                id: "1",
                apy: 10,
                poolAddress: "0x0",
                poolName: "Fake Pool",
                description: "This is a fake pool for testing",
                bannerImageUrl: "https://example.com/banner.jpg",
                thumbnailImageUrl: "https://example.com/thumbnail.jpg",
                strategyDeckUrl: "https://example.com/strategy.pdf",
                tranches: new Array<TrancheData>(),
                assetClass: "assetClass1",
                industryExposure: "industryExposure1",
                poolApyStructure: "poolApyStructure1",
                poolInvestmentTerm: "poolInvestmentTerm1",
                loanStructure: "loanStructure1",
                totalValueLocked: 5000,
                loansUnderManagement: 10,
                yieldEarned: 200,
                poolCapacity: 6000,
                activeLoans: 7,
            },
            {
                id: "2",
                apy: 20,
                poolAddress: "0x1",
                poolName: "Second Fake Pool",
                description: "This is another fake pool for testing",
                bannerImageUrl: "https://example2.com/banner.jpg",
                thumbnailImageUrl: "https://example2.com/thumbnail.jpg",
                strategyDeckUrl: "https://example2.com/strategy.pdf",
                tranches: new Array<TrancheData>(),
                assetClass: "assetClass2",
                industryExposure: "industryExposure2",
                poolApyStructure: "poolApyStructure2",
                poolInvestmentTerm: "poolInvestmentTerm2",
                loanStructure: "loanStructure2",
                totalValueLocked: 2000,
                loansUnderManagement: 5,
                yieldEarned: 100,
                poolCapacity: 2500,
                activeLoans: 3,
            },
        ];
        if(!id_in.length){
            return fakeData;
        }
        return fakeData.filter(data => id_in.includes(data.id));
    }

    getRiskManagement(id_in: string[]): RiskManagement[]{
        const fakeRiskPerformanceData: RiskPerformance[] = [
            { id: '1', poolLossRate: 5, independentRiskScore: 8, communityRating: 7},
            { id: '2', poolLossRate: 7, independentRiskScore: 6, communityRating: 8},
        ];

        const fakeData: RiskManagement[] = [
            {
                id: "1",
                securityStructureEndBorrowers: "securityStructureEndBorrowers1",
                minimumCriteriaEndBorrowers: "minimumCriteriaEndBorrowers1",
                riskPerformance: fakeRiskPerformanceData[0],
            },
            {
                id: "2",
                securityStructureEndBorrowers: "securityStructureEndBorrowers2",
                minimumCriteriaEndBorrowers: "minimumCriteriaEndBorrowers2",
                riskPerformance: fakeRiskPerformanceData[1],
            },
        ];
        if(!id_in.length){
            return fakeData;
        }
        return fakeData.filter(data => id_in.includes(data.id));
    }

    getPoolDelegateProfileAndHistory(id_in: string[]): PoolDelegateProfileAndHistory[] {
        const fakeData: PoolDelegateProfileAndHistory[] = [
            {
                id: "1",
                poolIdFK: "1",
                delegateLendingHistory: "Fake lending history 1",
                assetClass: "assetClass1",
                otherKASUPools: ["Fake KASU pool 1", "Fake KASU pool 2"],
                totalLoanFundsOriginated: 10000,
                totalLoansOriginated: 20,
                loansUnderManagement: 10,
                historicLossRate: 2,
            },
            {
                id: "2",
                poolIdFK: "2",
                delegateLendingHistory: "Fake lending history 2",
                assetClass: "assetClass2",
                otherKASUPools: ["Fake KASU pool 3", "Fake KASU pool 4"],
                totalLoanFundsOriginated: 20000,
                totalLoansOriginated: 40,
                loansUnderManagement: 15,
                historicLossRate: 3,
            },
        ];
        if(!id_in.length){
            return fakeData;
        }
        return fakeData.filter(data => id_in.includes(data.id));
    }

    getPoolTranches(id_in: string[]): PoolTranches[] {
        const fakeData: PoolTranches[] = [
            {
                id: "1",
                poolIdFK: "1",
                apy: 2.5,
                remainingCapacity: 1000,
                minimalDepositThreshold: 100,
                maximalDepositThreshold: 500
            },
            {
                id: "2",
                poolIdFK: "1",
                apy: 3.0,
                remainingCapacity: 2000,
                minimalDepositThreshold: 200,
                maximalDepositThreshold: 1000
            },
        ];
        if(!id_in.length){
            return fakeData;
        }
        return fakeData.filter(data => id_in.includes(data.id));
    }
}