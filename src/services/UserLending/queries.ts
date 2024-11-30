import { gql } from 'graphql-request';

export const userRequestsQuery = gql`
    query userRequestsQuery($userAddress: String!, $unusedPools: [String]!) {
        userRequests(
            where: { user: $userAddress, lendingPool_not_in: $unusedPools }
        ) {
            amountAccepted
            amountRejected
            epochId
            amountRequested
            createdOn
            id
            nftId
            status
            type
            updatedOn
            lendingPool {
                id
                name
                balance
                tranches {
                    orderId
                    shares
                }
            }
            tranche {
                id
                orderId
            }
            user {
                id
            }
            userRequestEvents {
                tranche {
                    orderId
                    id
                }
                sharesAmount
                index
                id
                createdOn
                assetAmount
                transactionHash
                type
            }
        }
    }
`;

export const lendingPoolUserDetailsQuery = gql`
    query LendingPoolUserDetailsQuery($userAddress: String!) {
        lendingPoolUserDetails(id: $userAddress) {
            id
            totalAcceptedDeposits
            totalAcceptedWithdrawnAmount
        }
    }
`;

export const trancheUserDetailsQuery = gql`
    query TrancheUserDetailsQuery($userAddress: String!) {
        lendingPoolTrancheUserDetails(id: $userAddress) {
            id
            totalAcceptedDeposits
            totalAcceptedWithdrawnAmount
        }
    }
`;

export const totalUserLoyaltyRewardsQuery = gql`
    query TotalUserLoyaltyRewardsQuery($userAddress: String!) {
        user(id: $userAddress) {
            totalUserLoyaltyRewards
        }
    }
`;

export const currentEpochDepositedAmountQuery = gql`
    query CurrentEpochDepositedAmountQuery($id: String) {
        lendingPoolUserDetails(id: $id) {
            lendingPoolTrancheUserDetails {
                tranche {
                    id
                }
                totalPendingDepositAmount
            }
        }
    }
`;

export const currentEpochFtdAmountQuery = gql`
    query CurrentEpochFtdAmountQuery(
        $userId: String
        $poolId: String
        $currentEpoch: BigInt
    ) {
        userRequests(
            where: {
                user: $userId
                lendingPool: $poolId
                epochId: $currentEpoch
            }
        ) {
            fixedTermConfigId
            amountRequested
            tranche {
                id
            }
        }
    }
`;

export const currentFtdBalanceQuery = gql`
    query CurrentFtdBalanceQuery($userId: String, $poolId: String) {
        userLendingPoolTrancheFixedTermDepositLocks(
            where: { user: $userId, lendingPool: $poolId, isLocked: true }
        ) {
            trancheShares
            lendingPoolTrancheFixedTermConfig {
                configId
                lendingPoolTranche {
                    id
                }
            }
            lendingPool {
                balance
                tranches {
                    shares
                }
            }
        }
    }
`;
