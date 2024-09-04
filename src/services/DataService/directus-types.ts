export interface DirectusSchema {
    PoolOverview: PoolOverviewDirectus[];
    PoolDelegateProfileAndHistory: PoolDelegateProfileAndHistoryDirectus[];
    RiskManagement: RiskManagementDirectus[];
    RiskManagementItems: RiskManagementItemDirectus[];
    PoolCreditMetrics: PoolCreditMetricsDirectus[];
    BadAndDoubtfulDebts: BadAndDoubtfulDebtsDirectus[];
    FinancialReportingDocuments: FinancialReportingDocumentsDirectus[];
    PoolRepayments: PoolRepaymentDirectus[];
    KeyCreditMetrics: KeyCreditMetricsDirectus[];
    BadAndDoubtfulDebtsItems: BadAndDoubtfulDebtsItems[];
}

export interface PoolOverviewDirectus {
    id: string;
    enabled: boolean;
    security: string;
    apy: number;
    description: string;
    bannerImage: string;
    thumbnailImage: string;
    strategyDeck: string;
    assetClass: string;
    industryExposure: string;
    poolApyStructure: 'Variable' | 'Fixed';
    apyExpiryDate: number | null;
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
    keyCreditMetrics:
        | {
              keyCreditMetric: {
                  key: number;
                  collection: string;
              };
              mostRecentQuarter: number;
              previousFiscalYear: number;
              priorMonth: number;
          }[]
        | null;
}

export interface KeyCreditMetricsDirectus {
    id: number;
    name: string;
    tooltip?: string;
    unit: string;
}
export interface BadAndDoubtfulDebtsItems {
    id: string;
    name: string;
    tooltip?: string;
    unit?: string;
}

export interface BadAndDoubtfulDebtsDirectus {
    id: string;
    poolIdFK: string;
    items: {
        item: {
            key: string;
            collection: string;
        };
        totalLifetimeAmount: number | null;
        totalLifetimePercentage: number | null;
        monthlyAverageAmount: number | null;
        monthlyAveragePercentage: number | null;
        currentAmount: number | null;
        currentPercentage: number | null;
    }[];
}

export interface FinancialReportingDocumentsItemsDirectus {
    id: number;
    date_created: string;
    name: string;
    description: string;
    document: string;
    version: number;
    financialReportingDocumentsFK: string;
}
export interface FinancialReportingDocumentsDirectus {
    id: string;
    poolIdFK: string;
    documents: FinancialReportingDocumentsItemsDirectus[];
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
    UpcomingLendingFundsFlow: { label: string; value: number }[] | null;
    CumulativeLendingFundsFlow: { label: string; value: number }[] | null;
}
