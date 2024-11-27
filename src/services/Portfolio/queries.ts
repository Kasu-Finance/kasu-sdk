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

export const lendingPortfolioQuery = gql`
    query LastEpochQuery(
        $userAddress: ID!
        $epochId: BigInt!
        $lastEpochId: BigInt!
        $unusedPools: [String!]!
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
                        where: { epochId_lt: $epochId }
                        first: 1
                    ) {
                        shares
                    }
                    userLendingPoolTrancheFixedTermDepositLocks {
                        isLocked
                        unlockAmount
                        initialAmount
                        lockId
                        initialTrancheShares
                        isWithdrawalRequested
                        createdOn
                        epochLockStart
                        epochLockEnd
                        trancheShares
                        lendingPoolTrancheFixedTermConfig {
                            epochLockDuration
                            configId
                        }
                        userLendingPoolTrancheFixedTermDepositLockShareUpdate(
                            orderBy: shareUpdatesIndex
                            orderDirection: desc
                            first: 1
                            where: { epochId_lt: $lastEpochId }
                        ) {
                            shares
                        }
                    }
                    tranche {
                        id
                        shares
                        balance
                        lendingPoolTrancheShareUpdates(
                            first: 1
                            orderBy: shareUpdatesIndex
                            orderDirection: desc
                            where: { epochId_lt: $epochId }
                        ) {
                            shares
                        }
                        lendingPoolTrancheEpochInterest(
                            first: 1
                            orderBy: epochId
                            orderDirection: desc
                            where: { epochId_lt: $epochId }
                        ) {
                            epochInterestAmount
                        }
                    }
                }
            }
        }
    }
`;
