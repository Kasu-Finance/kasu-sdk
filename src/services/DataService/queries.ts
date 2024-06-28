import { gql } from 'graphql-request';

export const getPoolOverviewQuery = (ids?: string[]): string => gql`
    query getAllPoolOverview($unusedPools: [String]!) {
        lendingPools(
            where: { 
                id_not_in: $unusedPools
                ${ids?.length ? `, id_in: [${ids.map((id) => `"${id}"`).join(',')}]` : ''} 
            }
        ) {
            pendingPool {
                id
                totalPendingDepositAmounts
                totalPendingDepositsAmount
                totalPendingWithdrawalShares
            }
            id
            totalUserInterestAmount
            totalLossAmount
            name
            balance
            firstLostCapital
            isStopped
            tranches(orderBy: orderId, orderDirection: asc) {
                balance
                id
                totalInterestAmount
                orderId
            }
            configuration {
                desiredDrawAmount
                tranchesConfig {
                    desiredRatio
                    interestRate
                    minDepositAmount
                    maxDepositAmount
                }
            }
        }
    }
`;

export const getAllLendingPoolsQuery = gql`
    query getAllLendingPools($unusedPools: [String]!) {
        lendingPools(where: { id_not_in: $unusedPools }) {
            pendingPool {
                id
                totalPendingDepositAmounts
                totalPendingDepositsAmount
                totalPendingWithdrawalShares
            }
            id
            totalUserInterestAmount
            totalLossAmount
            name
            balance
            firstLostCapital
            isStopped
            tranches(orderBy: orderId, orderDirection: asc) {
                balance
                id
                totalInterestAmount
                orderId
            }
        }
    }
`;

export const getAllTranchesQuery = gql`
    query getAllTranches($unusedPools: [String]!) {
        lendingPoolTranches(where: { lendingPool_not_in: $unusedPools }) {
            id
            orderId
            totalInterestAmount
            balance
            lendingPool {
                id
            }
        }
    }
`;

export const getAllTrancheConfigurationsQuery = gql`
    query getAllTrancheConfigurations($unusedPools: [String]!) {
        lendingPoolTrancheConfigurations(
            where: { lendingPoolConfiguration_not_in: $unusedPools }
        ) {
            id
            orderId
            maxDepositAmount
            minDepositAmount
            interestRate
            desiredRatio
        }
    }
`;

export const getPoolNameQuery = gql`
    query getPoolName($ids: [String], $unusedPools: [String]!) {
        lendingPools(where: { id_in: $ids, id_not_in: $unusedPools }) {
            id
            name
        }
    }
`;

export const getAllLendingPoolConfigurationQuery = gql`
    query getAllLendingPoolConfigurations($unusedPools: [String]!) {
        lendingPoolConfigurations(where: { id_not_in: $unusedPools }) {
            desiredDrawAmount
            drawRecipient
            id
            minimumExcessLiquidityPercentage
            targetExcessLiquidityPercentage
            trancheInterestChangeEpochDelay
            tranchesConfig {
                desiredRatio
                interestRate
                id
                maxDepositAmount
                minDepositAmount
                orderId
            }
        }
    }
`;

export const getLendingPoolWithdrawalAndDepositsQuery = gql`
    query getLendingPoolWithdrawalAndDeposits($unusedPools: [String]!) {
        lendingPools(where: { id_not_in: $unusedPools }) {
            id
            pendingPool {
                totalPendingDepositAmounts
                totalPendingDepositsAmount
                totalPendingWithdrawalShares
            }
            totalDepositsAccepted
            totalWithdrawalsAccepted
        }
    }
`;
