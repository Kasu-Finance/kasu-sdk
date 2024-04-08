
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
    totalValueLocked: string; // SUBGRAPH
    loansUnderManagement: string; // SUBGRAPH
    yieldEarned: string; // SUBGRAPH
    poolCapacity: string; // SUBGRAPH
    activeLoans: string; // SUBGRAPH
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

export interface PoolTranche {
    id: string; // subgraph
    poolIdFK: string; // subgraph
    apy: string; // subgraph
    remainingCapacity: string; // subgraph
    minimalDepositThreshold: string; // subgraph
    maximalDepositThreshold: string; // subgraph
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
    apy: string;
    maximumDeposit: string;
    minimumDeposit: string;
    poolCapacity: string;
    name: string;
}

export interface PoolCreditMetrics {
    id: string;
    poolIdFK: string;
    keyCreditMetric: string;
    previousFiscalYear: number;
    mostRecentQuarter: number;
    priorMonth: number;
}

export interface BadAndDoubtfulDebts {
    id: string;
    poolIdFK: string;
    name: string;
    totalAmount: number;
    totalPercentage: number;
    monthlyAverageAmount: number;
    monthlyAveragePercentage: number;
    currentStatusAmount: number;
    currentStatusPercentage: number;
}

export interface PoolRepayment {
    id: string;
    poolIdFK: string;
    cumulativeLendingFundsFlow_ClosingLoansBalance: number;
    cumulativeLendingFundsFlow_InterestAccrued: number;
    cumulativeLendingFundsFlow_InterestPayments: number;
    cumulativeLendingFundsFlow_LoansDrawn: number;
    cumulativeLendingFundsFlow_OpeningLoansBalance: number;
    cumulativeLendingFundsFlow_PrincipalRepayments: number;
    cumulativeLendingFundsFlow_UnrealisedLosses: number;
    upcomingLendingFundsFlow_NetInflows: number;
    upcomingLendingFundsFlow_1_Key: string;
    upcomingLendingFundsFlow_1_Value: number;
    upcomingLendingFundsFlow_2_Key: string;
    upcomingLendingFundsFlow_2_Value: number;
    upcomingLendingFundsFlow_3_Key: string;
    upcomingLendingFundsFlow_3_Value: number;
    upcomingLendingFundsFlow_4_Key: string;
    upcomingLendingFundsFlow_4_Value: number;
}
