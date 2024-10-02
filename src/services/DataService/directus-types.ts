export interface DirectusSchema {
    PoolOverview: PoolOverviewDirectus[];
    PoolDelegateProfileAndHistory: PoolDelegateProfileAndHistoryDirectus[];
    RiskManagement: RiskManagementDirectus[];
    RiskManagementItems: RiskManagementItemDirectus[];
    RiskManagementGroups: RiskManagementGroupDirectus[];
    PoolCreditMetrics: PoolCreditMetricsDirectus[];
    BadAndDoubtfulDebts: BadAndDoubtfulDebtsDirectus[];
    FinancialReportingDocuments: FinancialReportingDocumentsDirectus[];
    FinancialReportingDocumentsItems: FinancialReportingDocumentsItemsDirectus[];
    PoolRepayments: PoolRepaymentDirectus[];
    PoolRepaymentItems: PoolRepaymentItemsDirectus[];
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
    riskManagementItems: {
        riskManagementItem: {
            key: string;
            collection: string;
        };
        description: string;
    }[];
}

export interface RiskManagementItemDirectus {
    name: string;
    group: {
        key: string;
        collection: string;
    };
    tooltip: string;
}

export interface RiskManagementGroupDirectus {
    name: string;
}

export interface PoolCreditMetricsDirectus {
    id: string;
    poolIdFK: string;
    keyCreditMetrics: {
        keyCreditMetric: {
            key: string;
            collection: string;
        };
        mostRecentQuarter: number;
        previousFiscalYear: number;
        priorMonth: number;
    }[];
}

export interface KeyCreditMetricsDirectus {
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
    documents: number[] | null;
}

export interface PoolRepaymentItemsDirectus {
    name: string;
    tooltip: string;
}
export interface PoolRepaymentDirectus {
    id: string;
    poolIdFK: string;
    repaymentsFile: string;
    currentTotalEndBorrowers: number;
    UpcomingLendingFundsFlow: {
        repaymentItem: {
            key: string;
            collection: string;
        };
        value: number;
    }[];
    CumulativeLendingFundsFlow: {
        repaymentItem: {
            key: string;
            collection: string;
        };
        value: number;
    }[];
    CumulativeLendingAndWithdrawals: {
        repaymentItem: {
            key: string;
            collection: string;
        };
        value?: number;
        key?: string;
    }[];
    LendingAndWithdrawalRequests: {
        repaymentItem: {
            key: string;
            collection: string;
        };
        value?: number;
        key?: string;
    }[];
}
