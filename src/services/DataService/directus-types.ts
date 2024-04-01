export interface DirectusSchema {
    PoolOverview: PoolOverviewDirectus[];
    PoolDelegateProfileAndHistory: PoolDelegateProfileAndHistoryDirectus[];
    RiskManagement: RiskManagementDirectus[];
    RiskManagementItems: RiskManagementItemDirectus[];
    PoolCreditMetrics: PoolCreditMetricsDirectus[];
    BadAndDoubtfulDebts: BadAndDoubtfulDebtsDirectus[];
    FinancialReportingDocuments: FinancialReportingDocumentsDirectus[];
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
    icrPreviousFiscalYear: number;
    icrRecentQuarter: number;
    icrPriorMonth: number;
    dscrPreviousFiscalYear: number;
    dscrRecentQuarter: number;
    dscrPriorMonth: number;
    ltvrPreviousFiscalYear: number;
    ltvrRecentQuarter: number;
    ltvrPriorMonth: number;
}

export interface BadAndDoubtfulDebtsDirectus {
    id: string;
    poolIdFK: string;
    name: string;
    arrearsMonthlyAverage: string;
    defaultsMonthlyAverage: string;
    recoveryActionMonthlyAverage: string;
    lossesMonthlyAverage: string;
    arrearsCurrentStatus: string;
    defaultsCurrentStatus: string;
    recoveryActionCurrentStatus: string;
    lossesCurrentStatus: string;
    lossesLifetime: string;
}

export interface FinancialReportingDocumentsDirectus {
    id: string;
    name: string;
    description: string;
    uploadTimestamp: number;
    version: number;
    documentUrl: string;
    poolIdFK: string;
}