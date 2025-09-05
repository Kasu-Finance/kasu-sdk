import { BigNumber } from 'ethers';

import { UserRequestStatus } from './subgraph-types';

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
    tranche: string;
    requested: number;
    accepted: number;
    rejected: number;
    timestamp: number;
    status: string;
}

export interface UserRequest {
    id: string;
    userId: string;
    lendingPool: {
        id: string;
        name: string;
        tranches: { orderId: string }[];
    };
    requestType: 'Deposit' | 'Withdrawal';
    trancheId: string;
    trancheName: string;
    requestedAmount: string;
    acceptedAmount: string;
    rejectedAmount: string;
    timestamp: EpochTimeStamp;
    status: UserRequestStatus;
    canCancel: boolean;
    events: UserRequestEvent[];
    nftId: string;
    apy: string;
    fixedTermConfig:
        | {
              configId: string;
              apy: string;
              epochLockDuration: string;
              epochInterestRate: string;
          }
        | undefined;
}

export interface UserRequestEvent {
    id: string;
    requestType:
        | 'Initiated'
        | 'Increased'
        | 'Cancelled'
        | 'Accepted'
        | 'Rejected'
        | 'Reallocated'
        | 'Forced';
    assetAmount: string;
    totalRequested: string;
    totalAccepted: string;
    totalRejected: string;
    index: number;
    timestamp: EpochTimeStamp;
    transactionHash: string;
    trancheName: string;
    trancheId: string;
    apy: string;
    epochId: string;
}
export interface UserTrancheBalance {
    userId: string;
    address: string;
    yieldEarned: number;
    balance: string;
    availableToWithdraw: BigNumber;
    trancheId: string;
}

export type PortfolioUserTrancheBalance = Map<
    string,
    {
        trancheId: string;
        yieldEarned: number;
        userBalance: string;
    }[]
>;

export interface UserPoolBalance {
    poolId: string;
    yieldEarned: number;
    balance: BigNumber;
}

export enum UserRequestType {
    DEPOSIT = 'DepositRequest',
    WITHDRAW = 'WithdrawRequest',
}

export enum UserRequestEventType {
    DEPOSIT_INITIATED = 'DepositInitiated',
    ACCEPTED = 'DepositAccepted',
    REJECTED = 'DepositRejected',
    CANCELLED = 'DepositCancelled',
    WITHDRAWAL_INITIATED = 'WithdrawalInitiated',
}

export interface UserApyBonus {
    balance: BigNumber;
    lifetime: number;
}
