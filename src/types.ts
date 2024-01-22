import { BigNumber, Bytes } from "ethers";

export interface RSVDeadlineValue {
    value: number;
    deadline: number;
    v: number;
    r: Bytes;
    s: Bytes;
}

export interface LockPeriodInterface {
    rKsuMultiplier: number,
    ksuBonusMultiplier: number,
    isActive: boolean
}

export interface LockPeriod {
    rKsuMultiplier: number,
    lockPeriod: number,
    ksuBonusMultiplier: number
}

export interface UserLock {
    amount: BigNumber;
    rKSUAmount: BigNumber;
    rKSUMultiplier: BigNumber;
    startTime: number;
    lockPeriod: BigNumber;
}

export interface GQLGetLockingPeriods{
    lockPeriods: {
        rKSUMultiplier: any,
        ksuBonusMultiplier: any,
        
    }
}