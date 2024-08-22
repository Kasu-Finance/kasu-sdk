import { gql } from 'graphql-request';

export const claimedFeesQuery = gql`
    query GetClaimedFeesForAddress($userAddress: String!) {
        userLockDepositsInfo(id: $userAddress) {
            feesClaimed
        }
    }
`;

export const userEarnedrKsuQuery = gql`
    query GetClaimedFeesForAddress($userAddress: String!) {
        userLockDepositsInfo(id: $userAddress) {
            rKSUAmount
        }
    }
`;

export const userTotalBonusAmountQuery = gql`
    query GetClaimedFeesForAddress($userAddress: String!) {
        userLockDepositsInfo(id: $userAddress) {
            totalKsuBonusAmount
        }
    }
`;

export const userStakedKsuQuery = gql`
    query GetUserLockDepositsInfo($userAddress: String!) {
        userLockDepositsInfo(id: $userAddress) {
            ksuLockedAmount
        }
    }
`;

export const userLocksQuery = gql`
    query GetUserLocks($userAddress: String!) {
        userLocks(
            where: { userLockDepositsInfo: $userAddress, ksuAmount_gt: 0 }
        ) {
            id
            ksuAmount
            endTimestamp
            startTimestamp
            lockPeriod {
                rKSUMultiplier
                lockPeriod
                ksuBonusMultiplier
                id
            }
            rKSUAmount
            userLockDepositsInfo {
                totalKsuBonusAmount
                rKSUAmount
                ksuLockedAmount
                id
                feesClaimed
            }
        }
    }
`;

export const lockingPeriodsQuery = gql`
    query LockingPeriodsQuery {
        lockPeriods(orderBy: lockPeriod, where: { isActive: true }) {
            rKSUMultiplier
            lockPeriod
            ksuBonusMultiplier
            isActive
            id
        }
    }
`;

export const lockingSummariesQuery = gql`
    query LockingSummariesQuery {
        lockingSummaries {
            id
            totalRKsuAmount
            totalKsuLockedAmount
            totalFeesEmitted
        }
    }
`;

export const getAllTranchesQuery = gql`
    query getAllTranches($unusedPools: [String]!) {
        lendingPoolTranches(where: { lendingPool_not_in: $unusedPools }) {
            id
            balance
        }
    }
`;

export const getTotalUserLoyaltsRewardsQuery = gql`
    query getAllUserLoyaltsRewards($userAddress: String!) {
        user(id: $userAddress) {
            id
            totalUserLoyaltyRewards
        }
    }
`;

export const getSystemVariablesQuery = gql`
    query getSystemVariablesQuery {
        systemVariables(id: "SYSTEM_VARIABLES") {
            id
            protocolFeeRate
            priceUpdateEpoch
            performanceFee
            loyaltyThresholds
            ksuEpochTokenPrice
            epochDuration
            ecosystemFeeRate
            clearingPeriodLength
            canOnlyDepositJuniorWhenUserHasRKSU
        }
    }
`;
