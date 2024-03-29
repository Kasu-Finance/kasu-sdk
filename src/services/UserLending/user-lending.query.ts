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