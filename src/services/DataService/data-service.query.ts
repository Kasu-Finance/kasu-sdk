import { gql } from 'graphql-request';

export const getAllLendingPoolsQuery = gql`
    query getAllLendingPools {
      lendingPools {
        id
        totalUserYieldAmount
        totalLossAmount
        name
        balance
        firstLostCapital
        tranches(orderBy: orderId, orderDirection: asc) {
          balance
          id
          totalYieldAmount
          orderId
        }
      }
    }
`;

export const getAllTranchesQuery = gql`
    query getAllTranches {
      lendingPoolTranches {
        id
        orderId
        totalYieldAmount
        balance
        lendingPool {
          id
        }
      }
    }
`;

export const getAllTrancheConfigurationsQuery = gql`
    query getAllTrancheConfigurations {
        lendingPoolTrancheConfigurations {
            id
            orderId
            maxDepositAmount
            minDepositAmount
            interestRate
            desiredRatio
        }
    }
`;

export const getAllLendingPoolConfigurationQuery = gql`
    query getAllLendingPoolConfigurations {
      lendingPoolConfigurations {
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
}`;

export const getLendingPoolWithdrawalAndDepositsQuery = gql`
    query getLendingPoolWithdrawalAndDeposits {
      lendingPools {
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