import { gql } from 'graphql-request';

export const lastEpochQuery = gql`
    query LastEpochQuery(
        $userAddress: String!
        $epochId: String!
        $unusedPools: [String]!
    ) {
        user(id: $userAddress) {
            lendingPoolUserDetails(
                where: { lendingPool_not_in: $unusedPools }
            ) {
                id
                lendingPool {
                    id
                    name
                    balance
                    tranches {
                        shares
                    }
                }
                lendingPoolTrancheUserDetails {
                    lendingPoolTrancheUserEpochSharesUpdates(
                        orderDirection: desc
                        orderBy: shareUpdatesIndex
                        where: { epochId_lte: $epochId }
                        first: 1
                    ) {
                        shares
                    }
                    userLendingPoolTrancheFixedTermDepositLocks {
                        lockId
                        initialTrancheShares
                        isWithdrawalRequested
                        createdOn
                        epochLockStart
                        epochLockEnd
                        lendingPoolTrancheFixedTermConfig {
                            epochLockDuration
                        }
                    }
                    tranche {
                        id
                        lendingPoolTrancheShareUpdates(
                            orderBy: shareUpdatesIndex
                            orderDirection: desc
                            where: { epochId_lte: $epochId }
                            first: 1
                        ) {
                            shares
                        }
                        lendingPoolTrancheEpochInterest(
                            where: { epochId: $epochId }
                        ) {
                            epochInterestAmount
                        }
                    }
                }
            }
        }
    }
`;
