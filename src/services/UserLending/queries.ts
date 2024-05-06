import { gql } from 'graphql-request';

export const userRequestsQuery = gql`
    query userRequestsQuery($userAddress: String!) {
        userRequests(where: { user: $userAddress }) {
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
    query TrancheUserDetailsQuery($userAddress: String!, $trancheId: String!) {
        lendingPoolTrancheUserDetails(id: $userAddress, trancheId: $trancheId) {
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