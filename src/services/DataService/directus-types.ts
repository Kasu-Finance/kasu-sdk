export interface DirectusSchema {
    PoolOverview: PoolOverviewDirectus[];
    PoolDelegateProfileAndHistory: PoolDelegateProfileAndHistoryDirectus[];
    RiskManagement: RiskManagementDirectus[];
    RiskManagementItems: RiskManagementItemDirectus[];
    PoolCreditMetrics: PoolCreditMetricsDirectus[];
    BadAndDoubtfulDebts: BadAndDoubtfulDebtsDirectus[];
    FinancialReportingDocuments: FinancialReportingDocumentsDirectus[];
    PoolRepayments: PoolRepaymentDirectus[];
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
    loansUnderManagement: string;
    activeLoans: string;
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

export interface PoolCreditMetricsDirectus {
    id: string;
    poolIdFK: string;
    keyCreditMetric: string;
    previousFiscalYear: number;
    mostRecentQuarter: number;
    priorMonth: number;
}

export interface BadAndDoubtfulDebtsDirectus {
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

export interface FinancialReportingDocumentsDirectus {
    id: string;
    name: string;
    description: string;
    uploadTimestamp: number;
    version: string;
    documentUrl: string;
    poolIdFK: string;
}
export interface PoolRepaymentDirectus {
    id: string;
    poolIdFK: string;
    cumulativeLendingFundsFlow_InterestAccrued: number;
    cumulativeLendingFundsFlow_InterestPayments: number;
    cumulativeLendingFundsFlow_LoansDrawn: number;
    cumulativeLendingFundsFlow_OpeningLoansBalance: number;
    cumulativeLendingFundsFlow_PrincipalRepayments: number;
    cumulativeLendingFundsFlow_UnrealisedLosses: number;
    upcomingLendingFundsFlow_1_Key: string | null;
    upcomingLendingFundsFlow_1_Value: number | null;
    upcomingLendingFundsFlow_2_Key: string | null;
    upcomingLendingFundsFlow_2_Value: number | null;
    upcomingLendingFundsFlow_3_Key: string | null;
    upcomingLendingFundsFlow_3_Value: number | null;
    upcomingLendingFundsFlow_4_Key: string | null;
    upcomingLendingFundsFlow_4_Value: number | null;
}
