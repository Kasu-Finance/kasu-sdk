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
    rKSUtoUSDCRatio: number;
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
    } | undefined;
}
export interface GQLStakedAmountForAddress {
    userLockDepositsInfo: {
        ksuLockedAmount: string;
    } | undefined;
}

export interface GQLEarnedRKsuForAddress {
    userLockDepositsInfo: {
        rKSUAmount: string;
    } | undefined;
}

export interface GQLTotalBonusAmountForAddress {
    userLockDepositsInfo: {
        totalKsuBonusAmount: string;
    } | undefined;
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
