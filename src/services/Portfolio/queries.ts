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

/**
 * The portfolio read. Its last-epoch figures pair each tranche's newest
 * interest (epoch E) with the shares in force when clearing E applied it —
 * the selection `getYieldHistory` makes (`positionEpochYield`). For that it
 * reads, per lender and tranche, the newest share snapshot tagged before
 * `$recentEpoch` and EVERY snapshot tagged from it on (with their times), and,
 * for the listed pools (`$poolIds`) and tranches (`$trancheIds`), the
 * clearings and share exits of those recent epochs. `$recentEpoch` is six
 * epochs back (`RECENT_PAIRING_EPOCHS`); a newest interest older than that (a
 * pool that stopped clearing) is priced from a history read of its own. Lock
 * snapshots are read the same way from one epoch further back
 * (`$lockRecentEpoch`), since a top-up compares E with E − 1. Every list read
 * with `$first` must come back SHORT of it — a full one is refused, never
 * used truncated. `_meta` is the block the answer describes: the chain is
 * read at that same block.
 */
export const lendingPortfolioQuery = gql`
    query LastEpochQuery(
        $userAddress: ID!
        $epochId: BigInt!
        $lastEpochId: BigInt!
        $recentEpoch: BigInt!
        $lockRecentEpoch: BigInt!
        $unusedPools: [String!]!
        $poolIds: [String!]!
        $trancheIds: [String!]!
        $first: Int!
    ) {
        _meta {
            block {
                number
            }
        }
        user(id: $userAddress) {
            lendingPoolUserDetails(
                first: $first
                where: { lendingPool_not_in: $unusedPools }
            ) {
                id
                totalAcceptedDeposits
                totalAcceptedWithdrawnAmount
                lendingPool {
                    id
                    name
                    balance
                    tranches(first: $first) {
                        shares
                    }
                }
                lendingPoolTrancheUserDetails(first: $first) {
                    id
                    shares
                    totalAcceptedDeposits
                    totalAcceptedWithdrawnAmount
                    lendingPoolTrancheUserEpochSharesUpdates(
                        orderDirection: desc
                        orderBy: shareUpdatesIndex
                        where: { epochId_lt: $recentEpoch }
                        first: 1
                    ) {
                        epochId
                        shareUpdatesIndex
                        shares
                        timestamp
                    }
                    recentUserShareUpdates: lendingPoolTrancheUserEpochSharesUpdates(
                        orderDirection: desc
                        orderBy: shareUpdatesIndex
                        where: { epochId_gte: $recentEpoch }
                        first: $first
                    ) {
                        epochId
                        shareUpdatesIndex
                        shares
                        timestamp
                    }
                    userLendingPoolTrancheFixedTermDepositLocks(first: $first) {
                        id
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
                            epochInterestRate
                        }
                        userLendingPoolTrancheFixedTermDepositLockShareUpdate(
                            orderBy: shareUpdatesIndex
                            orderDirection: desc
                            first: 1
                            where: { epochId_lt: $lastEpochId }
                        ) {
                            shares
                        }
                        lockSharesAtLastEpoch: userLendingPoolTrancheFixedTermDepositLockShareUpdate(
                            orderBy: shareUpdatesIndex
                            orderDirection: desc
                            first: 1
                            where: { epochId_lt: $epochId }
                        ) {
                            shares
                        }
                        lockSharesBase: userLendingPoolTrancheFixedTermDepositLockShareUpdate(
                            orderBy: shareUpdatesIndex
                            orderDirection: desc
                            first: 1
                            where: { epochId_lt: $lockRecentEpoch }
                        ) {
                            epochId
                            shareUpdatesIndex
                            shares
                        }
                        lockSharesRecent: userLendingPoolTrancheFixedTermDepositLockShareUpdate(
                            orderBy: shareUpdatesIndex
                            orderDirection: desc
                            first: $first
                            where: { epochId_gte: $lockRecentEpoch }
                        ) {
                            epochId
                            shareUpdatesIndex
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
                            where: { epochId_lt: $recentEpoch }
                        ) {
                            epochId
                            shareUpdatesIndex
                            shares
                            timestamp
                        }
                        recentTrancheShareUpdates: lendingPoolTrancheShareUpdates(
                            first: $first
                            orderBy: shareUpdatesIndex
                            orderDirection: desc
                            where: { epochId_gte: $recentEpoch }
                        ) {
                            epochId
                            shareUpdatesIndex
                            shares
                            timestamp
                        }
                        lendingPoolTrancheEpochInterest(
                            first: 1
                            orderBy: epochId
                            orderDirection: desc
                            where: { epochId_lt: $epochId }
                        ) {
                            epochId
                            epochInterestAmount
                        }
                    }
                }
            }
        }
        lendingPoolClearings(
            first: $first
            orderBy: id
            orderDirection: asc
            where: {
                lendingPool_in: $poolIds
                epochId_gte: $recentEpoch
                epochId_lt: $epochId
            }
        ) {
            id
            epochId
            startTimestamp
            lendingPool {
                id
            }
        }
        recentWithdrawalsAccepted: userRequestEvents(
            first: $first
            orderBy: id
            orderDirection: asc
            where: {
                type_in: [WithdrawalAccepted, ImmediateWithdrawalExecuted]
                tranche_in: $trancheIds
                epochId_gte: $recentEpoch
                epochId_lt: $epochId
            }
        ) {
            id
            type
            epochId
            createdOn
            sharesAmount
            tranche {
                id
            }
        }
        userRequests(
            first: $first
            where: {
                user: $userAddress
                userRequestEvents_: {
                    type_in: [DepositInitiated, DepositIncreased]
                    additionalData_not: null
                }
            }
        ) {
            createdOn
            amountAccepted
            tranche {
                id
            }
            fixedTermConfigId
            userRequestEvents(
                first: $first
                where: { type_in: [DepositInitiated, DepositIncreased] }
            ) {
                id
                assetAmount
            }
        }
    }
`;
