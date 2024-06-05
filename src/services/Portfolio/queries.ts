import { gql } from 'graphql-request';


export const lastEpochQuery = gql`
    query LastEpochQuery($userAddress: String!, $epochId: String!) {
      user(id: $userAddress) {
        lendingPoolUserDetails {
          id
          lendingPool {
            id
            name
          }
          lendingPoolTrancheUserDetails {
            lendingPoolTrancheUserEpochSharesUpdates(
              orderDirection: desc
              orderBy: shareUpdatesIndex
              where: {epochId_lte: $epochId}
              first: 1
            ) {
              shares
            }
            tranche {
              id
              lendingPoolTrancheShareUpdates(
                orderBy: shareUpdatesIndex
                orderDirection: desc
                where: {epochId_lte: $epochId}
                first: 1
              ) {
                shares
              }
              lendingPoolTrancheEpochInterest(where: {epochId: $epochId}) {
                epochInterestAmount
              }
            }
          }
        }
      }
    }
`