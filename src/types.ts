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
    lockPeriod: BigNumber,
    ksuBonusMultiplier: number,
    id: BigNumber
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
        rKSUMultiplier: string,
        ksuBonusMultiplier: string,
        lockPeriod: string,
        id: string
    }[]
}
export interface GQLClaimedFeesForAddress {
    userLockDepositsInfos: {
        feesClaimed: string
    }[]
}