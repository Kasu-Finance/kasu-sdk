import {
    BadAndDoubtfulDebtsItems,
    KeyCreditMetricsDirectus,
} from './directus-types';

export interface PoolOverview {
    poolName: string;
    id: string;
    enabled: boolean;
    apy: number;
    description: string;
    bannerImageUrl: string;
    thumbnailImageUrl: string;
    strategyDeckUrl: string;
    tranches: TrancheData[];
    totalValueLocked: string;
    loansUnderManagement: string;
    yieldEarned: string;
    poolCapacity: string;
    poolCapacityPercentage: string;
    activeLoans: string;
    assetClass: string;
    security: string;
    industryExposure: string;
    poolApyStructure: 'Variable' | 'Fixed';
    apyExpiryDate: number | null;
    poolInvestmentTerm: string;
    loanStructure: string;
    loanFundsOriginated: string;
    isActive: boolean;
}

export interface PoolDelegateProfileAndHistory {
    id: string;
    delegateLendingHistory: number;
    assetClasses: string;
    otherKASUPools: {
        id: string;
        name: string;
    }[];
    totalLoanFundsOriginated: number;
    totalLoansOriginated: number;
    loansUnderManagement: number;
    historicLossRate: number;
}

export interface PoolTranche {
    id: string;
    poolIdFK: string;
    apy: string;
    minimalDepositThreshold: string;
    maximalDepositThreshold: string;
}

export interface RiskManagement {
    id: string;
    poolIdFK: string;
    items: RiskManagementItem[];
    riskPerformance: RiskPerformance;
}

export interface RiskManagementItem {
    description: string;
    name: string;
    group: string;
    tooltip: string;
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
    poolCapacityPercentage: string;
    name: string;
    interestRate: string;
}

export interface FinancialReportingDocuments {
    id: string;
    poolIdFK: string;
    documents: {
        id: number;
        date_created: string;
        name: string;
        description: string;
        document: string;
        version: number;
        financialReportingDocumentsFK: string;
    }[];
}

export interface PoolCreditMetrics {
    id: string;
    poolIdFK: string;
    keyCreditMetrics: {
        keyCreditMetric: KeyCreditMetricsDirectus;
        mostRecentQuarter: number;
        previousFiscalYear: number;
        priorMonth: number;
    }[];
}

export interface BadAndDoubtfulDebts {
    id: string;
    poolIdFK: string;
    items: {
        totalLifetimeAmount: number | null;
        totalLifetimePercentage: number | null;
        monthlyAverageAmount: number | null;
        monthlyAveragePercentage: number | null;
        currentAmount: number | null;
        currentPercentage: number | null;
        item: BadAndDoubtfulDebtsItems;
    }[];
}

export interface PoolRepayment {
    id: string;
    poolIdFK: string;
    currentTotalEndBorrowers: number;
    repaymentsFileUrl: string;
    upcomingLendingFundsFlow: {
        tooltip: string;
        name: string;
        value: number;
    }[];
    cumulativeLendingFundsFlow: {
        tooltip: string;
        name: string;
        value: number;
    }[];
    cumulativeLendingAndWithdrawals: {
        tooltip: string;
        name: string;
        value: number;
    }[];
    lendingAndWithdrawalRequests: {
        tooltip: string;
        name: string;
        value: number;
    }[];
}

export interface LendingTotals {
    totalValueLocked: number;
    loansUnderManagement: number;
    totalLoanFundsOriginated: number;
    totalYieldEarned: number;
    totalLossRate: number;
}
