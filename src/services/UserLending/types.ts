import { BigNumber } from 'ethers';

export interface UserInvestment {
    id: string;
    totalAmountInvested: number;
    weightedAverageAPY: number;
    totalYieldEarned: number;
    userTrancheData: UserTrancheData[];
}


export interface UserTrancheData {
    id: string;
    totalAmountInvested: number;
    trancheAPY: number;
    yieldEarned: number;
}

export interface UserTransactions {
    id: string;
    request: string;
    tranche: string
    requested: number;
    accepted: number;
    rejected: number;
    timestamp: number;
    status: string;
}

export interface UserRequest {
    id: string;
    userId: string;
    lendingPoolId: string;
    request: string;
    tranche: string;
    requested: number;
    accepted: number;
    rejected: number;
    timestamp: string;
    status: string;
    canCancel: boolean;
    events: UserRequestEvent[];
}

export interface UserRequestEvent {
    id: string;
    request: string;
    assetAmount: string;
    totalRequested: number;
    totalAccepted: number;
    totalRejected: number;
    index: number;
    timestamp: string;
    transactionHash: string;
}
export interface UserTrancheBalance {
    userId: string;
    address: string;
    yieldEarned: number;
    balance: BigNumber;
    availableToWithdraw: BigNumber;
}

export interface UserPoolBalance {
    userId: string;
    address: string;
    yieldEarned: number;
    balance: BigNumber;
}

export enum UserRequestStatus {
    REQUESTED = 'Requested',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
    CANCELLED = 'Cancelled'
}

export enum UserRequestType {
    DEPOSIT = 'DepositRequest',
    WITHDRAW = 'WithdrawRequest'
}

export enum UserRequestEventType {
    DEPOSIT_INITIATED = 'DepositInitiated',
    ACCEPTED = 'DepositAccepted',
    REJECTED = 'DepositRejected',
    CANCELLED = 'DepositCancelled',
    WITHDRAWAL_INITIATED = 'WithdrawalInitiated',
}