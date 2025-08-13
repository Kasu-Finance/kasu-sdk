import {
    TrancheConfigurationSubgraph,
    TrancheInterestRateUpdateSubgraph,
} from '../DataService/subgraph-types';

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
            configuration: {
                tranchesConfig: {
                    id: string;
                    interestRate: string;
                    lendingPoolTrancheInterestRateUpdates: TrancheInterestRateUpdateSubgraph[];
                    lendingPoolTrancheFixedTermConfigs: TrancheConfigurationSubgraph['lendingPoolTrancheFixedTermConfigs'];
                }[];
            };
        };
        fixedTermConfigId: string;
        tranche: {
            orderId: string;
            id: string;
            shares: string;
            balance: string;
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
            epochId: string;
            tranche: {
                id: string;
                orderId: string;
            };
        }[];
    }[];
}

export interface CurrentEpochDepositedAmountSubgraph {
    lendingPoolUserDetails_collection:
        | {
              lendingPoolTrancheUserDetails: {
                  tranche: {
                      id: string;
                  };
                  totalPendingDepositAmount: string;
              }[];
          }[]
        | null;
}

export interface CurrentEpochFtdAmountSubgraph {
    userRequests: {
        fixedTermConfigId: string;
        amountRequested: string;
        tranche: {
            id: string;
            balance: string;
            shares: string;
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
    user: {
        lendingPoolUserDetails: {
            lendingPool: {
                id: string;
            };
            totalAcceptedDeposits: string;
            totalAcceptedWithdrawnAmount: string;
        }[];
    } | null;
}

export interface TrancheUserDetailsSubgraph {
    lendingPoolTrancheUserDetails?: {
        id: string;
        totalAcceptedDeposits: string;
        totalAcceptedWithdrawnAmount: string;
        shares: string;
        tranche: {
            id: string;
            shares: string;
            balance: string;
        };
    };
}

export interface PortfolioTrancheUserDetailsSubgraph {
    user: {
        lendingPoolUserDetails: {
            lendingPool: {
                id: string;
            };
            lendingPoolTrancheUserDetails: TrancheUserDetailsSubgraph['lendingPoolTrancheUserDetails'][];
        }[];
    } | null;
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
