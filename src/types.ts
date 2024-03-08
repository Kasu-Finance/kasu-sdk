import { Bytes } from 'ethers';

export interface RSVDeadlineValue {
    value: number;
    deadline: number;
    v: number;
    r: Bytes;
    s: Bytes;
}

export interface LockPeriodInterface {
    rKsuMultiplier: number;
    ksuBonusMultiplier: number;
    isActive: boolean;
}

export interface LockPeriod {
    rKSUMultiplier: string;
    lockPeriod: string;
    ksuBonusMultiplier: string;
    id: string;
}

export interface UserLock {
    lockedAmount: string;
    rKSUAmount: string;
    startTime: EpochTimeStamp;
    endTime: EpochTimeStamp;
    lockPeriod: LockPeriod;
}

export interface GQLGetLockingPeriods {
    lockPeriods: LockPeriod[];
}
export interface GQLClaimedFeesForAddress {
    userLockDepositsInfo: {
        feesClaimed: string;
    };
}
export interface GQLUserLockDepositsInfo {
    userLockDepositsInfo: {
        ksuLockedAmount: string;
    };
}

export interface GQLUserLocks {
    userLocks: {
        ksuAmount: string;
        endTimestamp: string;
        startTimestamp: string;
        rKSUAmount: string;
        lockPeriod: LockPeriod;
    }[];
}

export interface PoolOverview {
    poolName: string;
    id: string;
    apy: number;
    description: string;
    bannerImageUrl: string;
    thumbnailImageUrl: string;
    strategyDeckUrl: string;
    tranches: TrancheData[];
    totalValueLocked: number;
    loansUnderManagement: number;
    yieldEarned: number;
    poolCapacity: number;
    activeLoans: number;
    assetClass: string;
    industryExposure: string;
    poolApyStructure: string;
    poolInvestmentTerm: string;
    loanStructure: string;
}

export interface PoolDelegateProfileAndHistory {
    id: string;
    poolIdFK: string;
    delegateLendingHistory: string;
    assetClass: string;
    otherKASUPools: string[];
    totalLoanFundsOriginated: number;
    totalLoansOriginated: number;
    loansUnderManagement: number;
    historicLossRate: number;
}

export interface PoolTranches {
    id: string;
    poolIdFK: string;
    apy: number;
    remainingCapacity: number;
    minimalDepositThreshold: number;
    maximalDepositThreshold: number;
}

export interface RiskManagement {
    id: string;
    securityStructureEndBorrowers: string;
    minimumCriteriaEndBorrowers: string;
    riskPerformance: RiskPerformance;
}

export interface RiskPerformance {
    id: string;
    poolLossRate: number;
    independentRiskScore: number;
    communityRating: number;
}

export interface TrancheData {
    id: string;
    apy: number;
    maximumDeposit: number;
    minimumDeposit: number;
    poolCapacity: number
}