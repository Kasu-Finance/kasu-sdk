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
                tranches {
                    orderId
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

export const lendingPoolsBalanceQuery = gql`
    query LendingPoolsBalanceQuery($unusedPools: [String]!) {
        lendingPools(where: { id_not_in: $unusedPools }) {
            id
            balance
            tranches {
                shares
            }
        }
    }
`;
