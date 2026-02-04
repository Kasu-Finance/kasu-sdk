import { gql, GraphQLClient } from 'graphql-request'
import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { FIVE_MINUTES } from '@/constants/general'

/**
 * Subgraph query result types
 */
type LendingPoolTrancheUserDetailsSubgraph = {
  shares: string
  totalAcceptedDeposits: string
  totalAcceptedWithdrawnAmount: string
  totalPendingDepositAmount: string
  tranche: {
    id: string
    name: string
    balance: string
    shares: string
    totalInterestAmount: string
    orderId: number
    lendingPool: {
      id: string
    }
  }
  userLendingPoolTrancheFixedTermDepositLocks: {
    id: string
    lockId: string
    trancheShares: string
    initialAmount: string
    unlockAmount: string | null
    epochLockStart: string
    epochLockEnd: string
    isLocked: boolean
    isWithdrawalRequested: boolean
    lendingPoolTrancheFixedTermConfig: {
      configId: string
      epochLockDuration: string
      epochInterestRate: string
    }
  }[]
}

type LendingPoolUserDetailsSubgraph = {
  lendingPool: {
    id: string
    name: string
    isStopped: boolean | null
  }
  totalRequestedDeposits: string
  totalAcceptedDeposits: string
  totalRejectedDeposits: string
  totalAcceptedWithdrawnAmount: string
  userLoyaltyRewards: string
  lendingPoolTrancheUserDetails: LendingPoolTrancheUserDetailsSubgraph[]
}

type UserPortfolioQueryResult = {
  user: {
    id: string
    totalUserLoyaltyRewards: string
    lendingPoolUserDetails: LendingPoolUserDetailsSubgraph[]
  } | null
}

/**
 * Processed/computed types for consumers
 */
export type UserTrancheData = {
  trancheId: string
  trancheName: string
  poolId: string
  orderId: number
  /** User's shares in this tranche */
  shares: string
  /** User's balance in assets (computed from shares) */
  balance: string
  /** Total accepted deposits (in assets) */
  totalAcceptedDeposits: string
  /** Total accepted withdrawals (in assets) */
  totalAcceptedWithdrawnAmount: string
  /** Pending deposit amount (in assets) */
  totalPendingDepositAmount: string
  /** Computed yield earned (balance - deposits + withdrawals) */
  yieldEarned: number
  /** Tranche totals for share-to-asset conversion */
  trancheTotalBalance: string
  trancheTotalShares: string
  /** Active fixed-term deposit locks */
  fixedTermLocks: UserFixedTermLock[]
}

export type UserFixedTermLock = {
  id: string
  lockId: string
  shares: string
  initialAmount: string
  unlockAmount: string | null
  epochLockStart: string
  epochLockEnd: string
  isLocked: boolean
  isWithdrawalRequested: boolean
  configId: string
  epochLockDuration: string
  epochInterestRate: string
}

export type UserPoolData = {
  poolId: string
  poolName: string
  isStopped: boolean
  totalRequestedDeposits: string
  totalAcceptedDeposits: string
  totalRejectedDeposits: string
  totalAcceptedWithdrawnAmount: string
  userLoyaltyRewards: string
  tranches: UserTrancheData[]
}

export type UserPortfolioData = {
  userId: string
  totalUserLoyaltyRewards: string
  pools: UserPoolData[]
  /** Flat list of all tranches across pools for easy iteration */
  allTranches: UserTrancheData[]
  /** Total balance across all tranches */
  totalBalance: number
  /** Total yield earned across all tranches */
  totalYieldEarned: number
}

/**
 * GraphQL query that fetches all user portfolio data in a single request.
 * This replaces 15+ individual RPC calls with 1 subgraph query.
 */
const userPortfolioQuery = gql`
  query UserPortfolioQuery($userAddress: String!) {
    user(id: $userAddress) {
      id
      totalUserLoyaltyRewards
      lendingPoolUserDetails {
        lendingPool {
          id
          name
          isStopped
        }
        totalRequestedDeposits
        totalAcceptedDeposits
        totalRejectedDeposits
        totalAcceptedWithdrawnAmount
        userLoyaltyRewards
        lendingPoolTrancheUserDetails {
          shares
          totalAcceptedDeposits
          totalAcceptedWithdrawnAmount
          totalPendingDepositAmount
          tranche {
            id
            name
            balance
            shares
            totalInterestAmount
            orderId
            lendingPool {
              id
            }
          }
          userLendingPoolTrancheFixedTermDepositLocks(
            where: { isLocked: true }
          ) {
            id
            lockId
            trancheShares
            initialAmount
            unlockAmount
            epochLockStart
            epochLockEnd
            isLocked
            isWithdrawalRequested
            lendingPoolTrancheFixedTermConfig {
              configId
              epochLockDuration
              epochInterestRate
            }
          }
        }
      }
    }
  }
`

/**
 * Convert shares to assets using the standard formula:
 * assets = (shares * totalAssets) / totalSupply
 */
const convertSharesToAssets = (
  sharesAmount: string,
  totalAssets: string,
  totalSupply: string
): string => {
  const shares = parseFloat(sharesAmount)
  const assets = parseFloat(totalAssets)
  const supply = parseFloat(totalSupply)

  if (supply === 0) return '0'
  return ((shares * assets) / supply).toString()
}

/**
 * Process raw subgraph data into a structured format for consumers.
 */
const processUserPortfolioData = (
  rawData: UserPortfolioQueryResult,
  userAddress: string
): UserPortfolioData | null => {
  if (!rawData.user) {
    // User has no lending activity - return empty portfolio
    return {
      userId: userAddress,
      totalUserLoyaltyRewards: '0',
      pools: [],
      allTranches: [],
      totalBalance: 0,
      totalYieldEarned: 0,
    }
  }

  const user = rawData.user
  const allTranches: UserTrancheData[] = []
  let totalBalance = 0
  let totalYieldEarned = 0

  const pools: UserPoolData[] = user.lendingPoolUserDetails.map(
    (poolDetail) => {
      const tranches: UserTrancheData[] =
        poolDetail.lendingPoolTrancheUserDetails.map((trancheDetail) => {
          // Convert shares to balance
          const balance = convertSharesToAssets(
            trancheDetail.shares,
            trancheDetail.tranche.balance,
            trancheDetail.tranche.shares
          )

          // Calculate yield earned: balance - deposits + withdrawals
          const balanceNum = parseFloat(balance)
          const depositsNum = parseFloat(trancheDetail.totalAcceptedDeposits)
          const withdrawalsNum = parseFloat(
            trancheDetail.totalAcceptedWithdrawnAmount
          )
          const yieldEarned = balanceNum - depositsNum + withdrawalsNum

          // Process fixed-term locks
          const fixedTermLocks: UserFixedTermLock[] =
            trancheDetail.userLendingPoolTrancheFixedTermDepositLocks.map(
              (lock) => ({
                id: lock.id,
                lockId: lock.lockId,
                shares: lock.trancheShares,
                initialAmount: lock.initialAmount,
                unlockAmount: lock.unlockAmount,
                epochLockStart: lock.epochLockStart,
                epochLockEnd: lock.epochLockEnd,
                isLocked: lock.isLocked,
                isWithdrawalRequested: lock.isWithdrawalRequested,
                configId: lock.lendingPoolTrancheFixedTermConfig.configId,
                epochLockDuration:
                  lock.lendingPoolTrancheFixedTermConfig.epochLockDuration,
                epochInterestRate:
                  lock.lendingPoolTrancheFixedTermConfig.epochInterestRate,
              })
            )

          const trancheData: UserTrancheData = {
            trancheId: trancheDetail.tranche.id,
            trancheName: trancheDetail.tranche.name,
            poolId: trancheDetail.tranche.lendingPool.id,
            orderId: trancheDetail.tranche.orderId,
            shares: trancheDetail.shares,
            balance,
            totalAcceptedDeposits: trancheDetail.totalAcceptedDeposits,
            totalAcceptedWithdrawnAmount:
              trancheDetail.totalAcceptedWithdrawnAmount,
            totalPendingDepositAmount: trancheDetail.totalPendingDepositAmount,
            yieldEarned,
            trancheTotalBalance: trancheDetail.tranche.balance,
            trancheTotalShares: trancheDetail.tranche.shares,
            fixedTermLocks,
          }

          // Accumulate totals
          totalBalance += balanceNum
          totalYieldEarned += yieldEarned
          allTranches.push(trancheData)

          return trancheData
        })

      return {
        poolId: poolDetail.lendingPool.id,
        poolName: poolDetail.lendingPool.name,
        isStopped: poolDetail.lendingPool.isStopped ?? false,
        totalRequestedDeposits: poolDetail.totalRequestedDeposits,
        totalAcceptedDeposits: poolDetail.totalAcceptedDeposits,
        totalRejectedDeposits: poolDetail.totalRejectedDeposits,
        totalAcceptedWithdrawnAmount: poolDetail.totalAcceptedWithdrawnAmount,
        userLoyaltyRewards: poolDetail.userLoyaltyRewards,
        tranches,
      }
    }
  )

  return {
    userId: user.id,
    totalUserLoyaltyRewards: user.totalUserLoyaltyRewards,
    pools,
    allTranches,
    totalBalance,
    totalYieldEarned,
  }
}

type UseUserPortfolioSubgraphOptions = {
  /** Whether to enable the query (default: true) */
  enabled?: boolean
  /** Filter to specific pool IDs (default: all pools) */
  poolIds?: string[]
}

/**
 * Hook for fetching user portfolio data from the subgraph.
 *
 * This hook replaces multiple RPC-heavy hooks with a single efficient subgraph query.
 * It fetches all user lending data including:
 * - Per-pool totals (deposits, withdrawals, loyalty rewards)
 * - Per-tranche balances and shares
 * - Fixed-term deposit locks
 * - Computed values (balance from shares, yield earned)
 *
 * @example
 * // Fetch all user portfolio data
 * const { portfolioData, isLoading } = useUserPortfolioSubgraph()
 *
 * // Access total balance
 * console.log(portfolioData?.totalBalance)
 *
 * // Iterate over pools
 * portfolioData?.pools.forEach(pool => {
 *   console.log(pool.poolName, pool.tranches.length)
 * })
 *
 * // Get flat list of all tranches
 * portfolioData?.allTranches.forEach(tranche => {
 *   console.log(tranche.trancheName, tranche.balance)
 * })
 */
export const useUserPortfolioSubgraph = (
  options?: UseUserPortfolioSubgraphOptions
) => {
  const { currentChainId, chainConfig } = useChain()
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const graphClient = useMemo(() => {
    if (!chainConfig.subgraphUrl) return null
    return new GraphQLClient(chainConfig.subgraphUrl)
  }, [chainConfig.subgraphUrl])

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled && address && currentChainId && graphClient
      ? ['userPortfolioSubgraph', currentChainId, address.toLowerCase()]
      : null,
    async ([_, __chainId, userAddress]): Promise<UserPortfolioData | null> => {
      if (!graphClient) throw new Error('GraphQL client not ready')

      const result = await graphClient.request<UserPortfolioQueryResult>(
        userPortfolioQuery,
        { userAddress }
      )

      return processUserPortfolioData(result, userAddress)
    },
    {
      dedupingInterval: FIVE_MINUTES,
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  // Optional filtering by pool IDs
  const filteredData = useMemo(() => {
    if (!data || !options?.poolIds?.length) return data

    const poolIdsLower = options.poolIds.map((id) => id.toLowerCase())
    const filteredPools = data.pools.filter((pool) =>
      poolIdsLower.includes(pool.poolId.toLowerCase())
    )
    const filteredTranches = data.allTranches.filter((tranche) =>
      poolIdsLower.includes(tranche.poolId.toLowerCase())
    )

    return {
      ...data,
      pools: filteredPools,
      allTranches: filteredTranches,
      totalBalance: filteredTranches.reduce(
        (sum, t) => sum + parseFloat(t.balance),
        0
      ),
      totalYieldEarned: filteredTranches.reduce(
        (sum, t) => sum + t.yieldEarned,
        0
      ),
    }
  }, [data, options?.poolIds])

  return {
    /** Processed user portfolio data */
    portfolioData: filteredData,
    /** Raw error from SWR */
    error,
    /** True while initial data is loading */
    isLoading: enabled && isLoading,
    /** True while revalidating */
    isValidating,
    /** Function to manually trigger revalidation */
    updatePortfolioData: mutate,
  }
}

export default useUserPortfolioSubgraph
