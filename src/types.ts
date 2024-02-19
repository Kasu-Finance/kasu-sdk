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
