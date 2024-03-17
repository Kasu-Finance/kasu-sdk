
export interface PoolOverview {
    poolName: string;
    id: string;
    poolAddress: string; // SUBGRAPH - CMS
    apy: number; // CMS
    description: string; // CMS
    bannerImageUrl: string; // CMS
    thumbnailImageUrl: string; // CMS
    strategyDeckUrl: string; // CMS
    tranches: TrancheData[]; // SUBGRAPH
    totalValueLocked: number; // SUBGRAPH
    loansUnderManagement: number; // SUBGRAPH
    yieldEarned: number; // SUBGRAPH
    poolCapacity: number; // SUBGRAPH
    activeLoans: number; // SUBGRAPH
    assetClass: string; // CMS
    industryExposure: string; // CMS
    poolApyStructure: string; // CMS
    poolInvestmentTerm: string; // CMS
    loanStructure: string; // CMS
}

export interface PoolDelegateProfileAndHistory {
    id: string; // CMS
    poolIdFK: string; // CMS
    delegateLendingHistory: number; // CMS
    assetClasses: string; // CMS
    otherKASUPools: string[]; // CMS
    totalLoanFundsOriginated: number; // CMS
    totalLoansOriginated: number; // CMS
    loansUnderManagement: number; // CMS
    historicLossRate: number; // CMS
}

export interface PoolTranches {
    id: string; // subgraph
    poolIdFK: string; // subgraph
    apy: number; // subgraph
    remainingCapacity: number; // subgraph
    minimalDepositThreshold: number; // subgraph
    maximalDepositThreshold: number; // subgraph
}

export interface RiskManagement {
    id: string; // cms
    poolIdFK: string;
    items: RiskManagementItem[]; // cms
    riskPerformance: RiskPerformance; // cms
}

export interface RiskManagementItem {
    id: string;
    title: string;
    tooltip: string;
    description: string;
    group: string;
    priority: number;
    fkRiskManagement: string;
}

export interface RiskPerformance {
    id: string;
    firstLossCapital: number;
    poolLossRate: number;
    independentRiskScore: number;
    communityRating: number;
}

export interface TrancheData {
    id: string;
    apy: number;
    maximumDeposit: number;
    minimumDeposit: number;
    poolCapacity: number;
}