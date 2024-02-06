import { gql } from 'graphql-request';

export const claimedFeesQuery = gql`
    query getClaimedFeesForAddress($userAddress: String!) {
        userLockDepositsInfo(id: $userAddress) {
            feesClaimed
        }
    }
`;

export const userStakedKsuQuery = gql`
    query getUserLockDepositsInfo($userAddress: String!) {
        userLockDepositsInfo(id: $userAddress) {
            ksuLockedAmount
        }
    }
`;

export const userLocksQuery = gql`
    query getUserLocks($userAddress: String!) {
        userLocks(where: { userLockDepositsInfo: $userAddress }) {
            ksuAmount
            endTimestamp
            startTimestamp
            rKSUAmount
        }
    }
`;
