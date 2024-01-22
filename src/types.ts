import { Bytes } from "ethers";

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