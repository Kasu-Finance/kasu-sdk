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

/**
 * The loyalty thresholds and per-level KSU bonus, as read from chain by
 * `Locking.getLoyaltySchedule()`.
 */
export interface LoyaltySchedule {
    /** `SystemVariables.loyaltyThresholds()`, FULL_PERCENT units (100 = 1 %). */
    thresholdsBps: number[];
    /** Per level (index = level), the annual KSU bonus as a fraction (`0.001` = 0.1 %). */
    apyBonuses: number[];
    /** Per level, `loyaltyEpochRewardRates(level)` as read (1e18 = 100 % an epoch). */
    epochRewardRates: BigNumber[];
}

export interface UserLock {
    id: BigNumber;
    lockedAmount: string;
    rKSUAmount: string;
    rKSUtoStableRatio: number;
    apyBonus: number;
    startTime: EpochTimeStamp;
    endTime: EpochTimeStamp;
    lockPeriod: LockPeriod;
}

export interface UserBonusData {
    ksuBonusAndRewards: string;
    protocolFeesEarned: string;
    ksuBonusAndRewardsLifetime: string;
    totalLockedAmount: string;
}

export interface GQLGetLockingPeriods {
    lockPeriods: LockPeriod[];
}
export interface GQLClaimedFeesForAddress {
    userLockDepositsInfo:
        | {
              feesClaimed: string;
          }
        | undefined;
}
export interface GQLStakedAmountForAddress {
    userLockDepositsInfo:
        | {
              ksuLockedAmount: string;
          }
        | undefined;
}

export interface GQLEarnedRKsuForAddress {
    userLockDepositsInfo:
        | {
              rKSUAmount: string;
          }
        | undefined;
}

export interface GQLTotalBonusAmountForAddress {
    userLockDepositsInfo:
        | {
              totalKsuBonusAmount: string;
          }
        | undefined;
}

export interface UserLockDepositsInfo {
    feesClaimed: string;
    ksuLockedAmount: string;
    rKSUAmount: string;
    totalKsuBonusAmount: string;
    id: string;
}

export interface GQLUserLocks {
    userLocks: {
        id: string;
        ksuAmount: string;
        endTimestamp: string;
        startTimestamp: string;
        rKSUAmount: string;
        lockPeriod: LockPeriod;
        userLockDepositsInfo: UserLockDepositsInfo;
    }[];
}

export interface LockingSummarySubgraphResult {
    lockingSummaries: {
        id: string;
        totalRKsuAmount: string;
        totalKsuLockedAmount: string;
        totalFeesEmitted: string;
    }[];
}

export interface TrancheConfigurationSubgraph {
    lendingPoolTrancheConfigurations: {
        id: string;
        interestRate: string;
    }[];
}

export interface TrancheSubgraph {
    id: string;
    balance: string;
}

export interface TrancheSubgraphResult {
    lendingPoolTranches: TrancheSubgraph[];
}

export interface totalUserLoyaltyRewards {
    user: {
        id: string;
        totalUserLoyaltyRewards: string;
    } | null;
}

export interface SystemVariables {
    systemVariables: {
        id: string;
        protocolFeeRate: string;
        priceUpdateEpoch: string;
        performanceFee: string;
        loyaltyThresholds: string;
        ksuEpochTokenPrice: string;
        epochDuration: string;
        ecosystemFeeRate: string;
        clearingPeriodLength: string;
        canOnlyDepositJuniorWhenUserHasRKSU: boolean;
    };
}
