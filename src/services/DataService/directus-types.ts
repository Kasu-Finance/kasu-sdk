export interface DirectusSchema {
    PoolOverview: PoolOverviewDirectus[];
    poolDelegateProfileAndHistory: PoolDelegateProfileAndHistoryDirectus[];
    riskManagement: RiskManagementDirectus[];
    riskManagementItem: RiskManagementItemDirectus[];
}


export interface PoolOverviewDirectus {
    id: string;
    apy: number;
    description: string;
    bannerImageUrl: string;
    thumbnailImageUrl: string;
    strategyDeckUrl: string;
    assetClass: string;
    industryExposure: string;
    poolApyStructure: string;
    poolInvestmentTerm: string;
    loanStructure: string;
}

export interface PoolDelegateProfileAndHistoryDirectus {
    id: string;
    poolIdFK: string;
    delegateLendingHistory: number;
    assetClasses: string;
    otherKASUPools: string;
    totalLoanFundsOriginated: number;
    totalLoansOriginated: number;
    loansUnderManagement: number;
    historicLossRate: number;
}

export interface RiskManagementDirectus {
    id: string;
    poolIdFK: string;
    firstLossCapital: number;
    poolLossRate: number;
    independentRiskScore: number;
    communityRating: number;
}

export interface RiskManagementItemDirectus {
    id: string;
    title: string;
    tooltip: string;
    description: string;
    group: string;
    priority: number;
    fkRiskManagement: string;
}
