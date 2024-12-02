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
            balance: string;
            tranches: {
                orderId: string;
                shares: string;
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

export interface CurrentEpochDepositedAmountSubgraph {
    lendingPoolUserDetails: {
        lendingPoolTrancheUserDetails: {
            tranche: {
                id: string;
            };
            totalPendingDepositAmount: string;
        }[];
    } | null;
}

export interface CurrentEpochFtdAmountSubgraph {
    userRequests: {
        fixedTermConfigId: string;
        amountRequested: string;
        tranche: {
            id: string;
        };
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
    | 'DepositReallocated'
    | 'DepositInitiated'
    | 'DepositIncreased'
    | 'DepositCancelled'
    | 'DepositAccepted'
    | 'DepositRejected';

export interface LendingPoolUserDetailsSubgraph {
    lendingPoolUserDetails?: {
        id: string;
        totalAcceptedDeposits: string;
        totalAcceptedWithdrawnAmount: string;
    };
}

export interface TrancheUserDetailsSubgraph {
    lendingPoolTrancheUserDetails?: {
        id: string;
        totalAcceptedDeposits: string;
        totalAcceptedWithdrawnAmount: string;
        shares: string;
        tranche: {
            shares: string;
            balance: string;
        };
    };
}

export interface TotalUserLoyaltyRewardsSubgraph {
    user?: {
        totalUserLoyaltyRewards: string;
    };
}
export interface LendingPoolsBalanceSubgraph {
    lendingPools: {
        id: string;
        balance: string;
        tranches: {
            shares: string;
        }[];
    }[];
}

export interface CurrentFtdBalanceSubgraph {
    userLendingPoolTrancheFixedTermDepositLocks: {
        trancheShares: string;
        lendingPoolTrancheFixedTermConfig: {
            configId: string;
            lendingPoolTranche: {
                id: string;
            };
        };
        lendingPool: {
            balance: string;
            tranches: {
                shares: string;
            }[];
        };
    }[];
}
