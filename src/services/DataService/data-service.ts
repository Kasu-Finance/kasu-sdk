import { GraphQLClient } from 'graphql-request';

import { SdkConfig } from '../../sdk-config';
import {
    MinimumCriteriaEndBorrower,
    Pool,
    PoolDelegateProfileAndHistory, PoolOverview, PoolTranches,
    RiskManagement, RiskPerformance, SecurityStructureEndBorrower, TrancheData
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
            { id: '1', firstLossCapital: 0.00, poolLossRate: 5, independentRiskScore: 8, communityRating: 7 },
            { id: '2', firstLossCapital: 0.00, poolLossRate: 7, independentRiskScore: 6, communityRating: 8 },
        ];

        const fakeSecurityStructureEndBorrowers: SecurityStructureEndBorrower[] = [{
            id: "1",
            directorsGuarantees: ['fake director guarantee 1', 'fake director guarantee 2'],
            chargeOverBusinessAsset: 'fake charge over business asset 1',
            controlOverBankAccounts: 'fake control over bank accounts 1',
          },
          {
            id: "2",
            directorsGuarantees: ['fake director guarantee 3', 'fake director guarantee 4'],
            chargeOverBusinessAsset: 'fake charge over business asset 2',
            controlOverBankAccounts: 'fake control over bank accounts 2',
          }];
          
          const fakeMinimumCriteriaEndBorrowers: MinimumCriteriaEndBorrower[] = [{
            id: "1",
            minimumYearsInBusiness: 'fake minimum years 1',
            propertyOwners: 'fake property owners 1',
          },
          {
            id: "2",
            minimumYearsInBusiness: 'fake minimum years 2',
            propertyOwners: 'fake property owners 2',
          }];

        const fakeData: RiskManagement[] = [
            {
                id: "1",
                securityStructureEndBorrowers: fakeSecurityStructureEndBorrowers[0],
                minimumCriteriaEndBorrowers: fakeMinimumCriteriaEndBorrowers[0],
                riskPerformance: fakeRiskPerformanceData[0],
            },
            {
                id: "2",
                securityStructureEndBorrowers: fakeSecurityStructureEndBorrowers[1],
                minimumCriteriaEndBorrowers: fakeMinimumCriteriaEndBorrowers[1],
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
                delegateLendingHistory: 1653303878,
                assetClasses: "assetClasses 1",
                otherKASUPools: ["Fake KASU pool 1", "Fake KASU pool 2"],
                totalLoanFundsOriginated: 10000,
                totalLoansOriginated: 20,
                loansUnderManagement: 10,
                historicLossRate: 2,
            },
            {
                id: "2",
                poolIdFK: "2",
                delegateLendingHistory: 1653303878,
                assetClasses: "assetClasses 2",
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

    getAllPools(): Pool[] {
        const fakeData = [
            {
              name: 'Pool 1',
              link: 'lending/1',
            },
            {
              name: 'Pool 2',
              link: 'lending/2',
            },
            {
              name: 'Pool 3',
              link: 'lending/pool-3',
            },
            {
              name: 'Pool 4',
              link: 'lending/pool-4',
            },
            {
              name: 'Pool 5',
              link: 'lending/pool-5',
            },
            {
              name: 'Pool 6',
              link: 'lending/pool-6',
            },
        ];
        return fakeData;
    }
}