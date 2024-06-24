export interface PoolOverview {
    poolName: string;
    id: string;
    poolAddress: string;
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
    industryExposure: string;
    poolApyStructure: string;
    poolInvestmentTerm: string;
    loanStructure: string;
    loanFundsOriginated: string;
    isActive: boolean;
}

export interface PoolDelegateProfileAndHistory {
    id: string;
    poolIdFK: string;
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
    id: string;
    title: string;
    tooltip: string;
    description: string;
    group: string;
    priority: number;
    riskManagementFK: string;
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
    currentTotalEndBorrowers: number;
    cumulativeLendingFundsFlow_ClosingLoansBalance: number;
    cumulativeLendingFundsFlow_InterestAccrued: number;
    cumulativeLendingFundsFlow_InterestPayments: number;
    cumulativeLendingFundsFlow_LoansDrawn: number;
    cumulativeLendingFundsFlow_OpeningLoansBalance: number;
    cumulativeLendingFundsFlow_PrincipalRepayments: number;
    cumulativeLendingFundsFlow_UnrealisedLosses: number;
    upcomingLendingFundsFlow_NetInflows: number;
    upcomingLendingFundsFlow_1_Key: string | null;
    upcomingLendingFundsFlow_1_Value: number;
    upcomingLendingFundsFlow_2_Key: string | null;
    upcomingLendingFundsFlow_2_Value: number;
    upcomingLendingFundsFlow_3_Key: string | null;
    upcomingLendingFundsFlow_3_Value: number;
    upcomingLendingFundsFlow_4_Key: string | null;
    upcomingLendingFundsFlow_4_Value: number;
    cumulativeDepositsAndWithdrawals_NetDeposits: number;
    cumulativeDepositsAndWithdrawals_CumulativeWithdrawals: number;
    cumulativeDepositsAndWithdrawals_CumulativeDeposits: number;
    depositAndWithdrawalRequests_NetDeposits: number;
    depositAndWithdrawalRequests_CurrentDepositsRequests: number;
    depositAndWithdrawalRequests_CurrentWithdrawalRequests: number;
    repaymentsFileUrl: string;
}

export interface LendingTotals {
    totalValueLocked: number;
    loansUnderManagement: number;
    totalLoanFundsOriginated: number;
    totalYieldEarned: number;
    totalLossRate: number;
}
