import { gql } from 'graphql-request';

export const userRequestsQuery = gql`
    query userRequestsQuery {
      userRequests {
        amountAccepted
        amountRejected
        amountRequested
        createdOn
        epochId
        id
        nftId
        lendingPool {
          id
        }
        tranche {
          id
        }
        user {
          id
        }
        type
        updatedOn
        status
        userRequestEvents {
          assetAmount
          createdOn
          id
          index
          sharesAmount
          transactionHash
          type
          tranche {
            id
          }
        }
        userRequestEventsCount
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
`