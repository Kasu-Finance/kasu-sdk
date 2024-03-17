import { BigNumber, Bytes } from 'ethers';

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
    id: BigNumber;
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
export interface GQLStakedAmountForAddress {
    userLockDepositsInfo: {
        ksuLockedAmount: string;
    };
}

export interface GQLEarnedRKsuForAddress {
    userLockDepositsInfo: {
        rKSUAmount: string;
    };
}

export interface GQLTotalBonusAmountForAddress {
    userLockDepositsInfo: {
        totalKsuBonusAmount: string;
    };
}

export interface GQLUserLocks {
    userLocks: {
        id: string;
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
    poolAddress: string;
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
    delegateLendingHistory: number;
    assetClasses: string;
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
    securityStructureEndBorrowers: SecurityStructureEndBorrower;
    minimumCriteriaEndBorrowers: MinimumCriteriaEndBorrower;
    riskPerformance: RiskPerformance;
}

export interface SecurityStructureEndBorrower {
    id: string;
    directorsGuarantees: string[];
    chargeOverBusinessAsset: string;
    controlOverBankAccounts: string;
}

export interface MinimumCriteriaEndBorrower {
    id: string;
    minimumYearsInBusiness: string;
    propertyOwners: string;
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
    apy: number;
    maximumDeposit: number;
    minimumDeposit: number;
    poolCapacity: number;
}

export interface PoolMetric {
    id: string
    content: string | number | string[]
    unit?: string
    isRating?: boolean
  }
  
  export interface PoolDetailSection {
    id: string
    metrics: PoolMetric[]
  }
  
  export interface Pool {
    name: string;
    link: string;
  }