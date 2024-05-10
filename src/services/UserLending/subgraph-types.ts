export interface UserRequestsSubgraph {
    userRequests: {
        id: string;
        amountRequested: string;
        amountAccepted: string;
        amountRejected: string;
        status: UserRequestStatus;
        createdOn: string;
        type: 'DepositRequest' | 'WithdrawalRequest';
        updatedOn: string;
        lendingPool: {
            id: string;
            name: string;
            tranches: {
                orderId: string;
            }[];
        };
        tranche: {
            orderId: string;
            id: string;
        };
        user: {
            id: string;
        };
        nftId: string;
        userRequestEvents: {
            assetAmount?: string;
            createdOn: string;
            id: string;
            index: string;
            type: UserRequestEventType;
            transactionHash: string;
            sharesAmount: string;
            tranche: {
                id: string;
                orderId: string;
            };
        }[];
    }[];
}

export enum UserRequestStatus {
    REQUESTED = 'Requested',
    PROCESSING = 'Processing',
    PROCESSED = 'Processed',
}

export type UserRequestEventType =
    | 'WithdrawalInitiated'
    | 'WithdrawalIncreased'
    | 'WithdrawalCancelled'
    | 'WithdrawalAccepted'
    | 'DepositReallocated';

export interface LendingPoolUserDetailsSubgraph {
    lendingPoolUserDetails: {
        id: string;
        totalAcceptedDeposits: string;
        totalAcceptedWithdrawnAmount: string;
    };
}

export interface TrancheUserDetailsSubgraph {
    lendingPoolTrancheUserDetails: {
        id: string;
        totalAcceptedDeposits: string;
        totalAcceptedWithdrawnAmount: string;
    };
}

export interface TotalUserLoyaltyRewardsSubgraph {
    user?: {
        totalUserLoyaltyRewards: string
    }
}