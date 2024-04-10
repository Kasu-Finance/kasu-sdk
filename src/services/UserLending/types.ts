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
        amountRequested: string;
        amountAccepted: string;
        amountRejected: string;
        status: string;
        createdOn: string;
        updatedOn: string;
        type: string;
        epochId: string;
        user: {
            id: string;
        };
        nftId: string;
        lendingPool: {
            id: string;
        };
        tranche: {
            id: string;
        };
        userRequestEvents: {
            assetAmount: string;
            createdOn: string;
            id: string;
            index: string;
            type: string;
            sharesAmount: string;
            tranche: {
                id: string;
            }
            transactionHash: string;
        }
        userRequestEventsCount: string;
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