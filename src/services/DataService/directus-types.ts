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
    bannerImage: string;
    thumbnailImage: string;
    strategyDeck: string;
    assetClass: string;
    industryExposure: string;
    poolApyStructure: string;
    poolInvestmentTerm: string;
    loanStructure: string;
    loansUnderManagement: string;
    activeLoans: string;
    loanFundsOriginated: string;
}

export interface PoolDelegateProfileAndHistoryDirectus {
    id: string;
    poolIdFK: string;
    delegateLendingHistory: number;
    assetClasses: string;
    otherPools: {
        PoolDelegateProfileAndHistory_id: string;
        PoolOverview_id: string;
        id: number;
    }[];
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
    riskManagementFK: string;
}

export interface PoolCreditMetricsDirectus {
    id: string;
    poolIdFK: string;
    keyCreditMetric: string;
    previousFiscalYear: number;
    mostRecentQuarter: number;
    priorMonth: number;
    tooltip: string;
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
    tooltip: string;
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
    CumulativeLendingFundsFlow_InterestAccrued: number;
    CumulativeLendingFundsFlow_InterestPayments: number;
    CumulativeLendingFundsFlow_LoansDrawn: number;
    CumulativeLendingFundsFlow_OpeningLoansBalance: number;
    CumulativeLendingFundsFlow_PrincipalRepayments: number;
    CumulativeLendingFundsFlow_UnrealisedLosses: number;
    UpcomingLendingFundsFlow_1_Key: string | null;
    UpcomingLendingFundsFlow_1_Value: number | null;
    UpcomingLendingFundsFlow_2_Key: string | null;
    UpcomingLendingFundsFlow_2_Value: number | null;
    UpcomingLendingFundsFlow_3_Key: string | null;
    UpcomingLendingFundsFlow_3_Value: number | null;
    UpcomingLendingFundsFlow_4_Key: string | null;
    UpcomingLendingFundsFlow_4_Value: number | null;
    repaymentsFile: string;
}
