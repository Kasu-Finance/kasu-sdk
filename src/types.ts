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
    lockedAmount: string;
    rKSUAmount: string;
    startTime: EpochTimeStamp;
    endTime: EpochTimeStamp;
}

export interface GQLGetLockingPeriods {
    lockPeriods: {
        rKSUMultiplier: string;
        ksuBonusMultiplier: string;
        lockPeriod: string;
        id: string;
    }[];
}
export interface GQLClaimedFeesForAddress {
    userLockDepositsInfos: {
        feesClaimed: string;
    }[];
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
    }[];
}
