'use client'

import { gql, GraphQLClient } from 'graphql-request'
import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { FIVE_MINUTES } from '@/constants/general'

/**
 * Subgraph query result types
 */
type UserLockSubgraph = {
  id: string
  ksuAmount: string
  rKSUAmount: string
  startTimestamp: string
  endTimestamp: string
  lockPeriod: {
    id: string
    lockPeriod: string
    rKSUMultiplier: string
    ksuBonusMultiplier: string
  }
}

type UserLockDepositsInfoSubgraph = {
  id: string
  ksuLockedAmount: string
  rKSUAmount: string
  totalKsuBonusAmount: string
  feesClaimed: string
  userLocks: UserLockSubgraph[]
}

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
    orderId: number
    lendingPool: {
      id: string
    }
  }
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

type SystemVariablesSubgraph = {
  ksuEpochTokenPrice: string
  epochDuration: string
  performanceFee: string
  priceUpdateEpoch: string
}

type LiteModeQueryResult = {
  user: {
    id: string
    totalUserLoyaltyRewards: string
    lendingPoolUserDetails: LendingPoolUserDetailsSubgraph[]
  } | null
  userLockDepositsInfo: UserLockDepositsInfoSubgraph | null
  systemVariables: SystemVariablesSubgraph | null
}

/**
 * Processed types for consumers
 */
export type LiteModeUserLock = {
  id: string
  ksuAmount: string
  rKSUAmount: string
  startTimestamp: number
  endTimestamp: number
  lockPeriodId: string
  lockPeriodDuration: string
  rKSUMultiplier: string
  ksuBonusMultiplier: string
}

export type LiteModeLockDepositsInfo = {
  ksuLockedAmount: string
  rKSUAmount: string
  totalKsuBonusAmount: string
  feesClaimed: string
}

export type LiteModeTrancheData = {
  trancheId: string
  trancheName: string
  poolId: string
  orderId: number
  shares: string
  balance: string
  totalAcceptedDeposits: string
  totalAcceptedWithdrawnAmount: string
  totalPendingDepositAmount: string
  yieldEarned: number
}

export type LiteModePoolData = {
  poolId: string
  poolName: string
  isStopped: boolean
  totalAcceptedDeposits: string
  totalAcceptedWithdrawnAmount: string
  userLoyaltyRewards: string
  tranches: LiteModeTrancheData[]
}

export type LiteModeSystemVariables = {
  ksuPrice: string
  ksuPriceDecimals: number
  epochDuration: string
  performanceFee: string
}

export type LiteModeData = {
  userId: string
  totalUserLoyaltyRewards: string
  /** User's lending portfolio data */
  pools: LiteModePoolData[]
  allTranches: LiteModeTrancheData[]
  totalBalance: number
  totalYieldEarned: number
  /** User's KSU locks */
  userLocks: LiteModeUserLock[]
  /** User's lock deposits summary */
  lockDepositsInfo: LiteModeLockDepositsInfo | null
  /** System-wide variables */
  systemVariables: LiteModeSystemVariables | null
}

/**
 * Comprehensive GraphQL query that fetches all Lite mode data in a single request.
 * This replaces ~15 sequential RPC calls with 1 subgraph query.
 */
const liteModeQuery = gql`
  query LiteModeQuery($userAddress: String!) {
    # User portfolio data
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
            orderId
            lendingPool {
              id
            }
          }
        }
      }
    }

    # User lock deposits info and locks
    userLockDepositsInfo(id: $userAddress) {
      id
      ksuLockedAmount
      rKSUAmount
      totalKsuBonusAmount
      feesClaimed
      userLocks {
        id
        ksuAmount
        rKSUAmount
        startTimestamp
        endTimestamp
        lockPeriod {
          id
          lockPeriod
          rKSUMultiplier
          ksuBonusMultiplier
        }
      }
    }

    # System variables (KSU price, epoch duration, etc.)
    systemVariables(id: "SYSTEM_VARIABLES") {
      ksuEpochTokenPrice
      epochDuration
      performanceFee
      priceUpdateEpoch
    }
  }
`

/**
 * Convert shares to assets using the standard formula
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
 * Process raw subgraph data into a structured format
 */
const processLiteModeData = (
  rawData: LiteModeQueryResult,
  userAddress: string
): LiteModeData => {
  const allTranches: LiteModeTrancheData[] = []
  let totalBalance = 0
  let totalYieldEarned = 0

  // Process portfolio data
  const pools: LiteModePoolData[] = []
  if (rawData.user) {
    for (const poolDetail of rawData.user.lendingPoolUserDetails) {
      const tranches: LiteModeTrancheData[] = []

      for (const trancheDetail of poolDetail.lendingPoolTrancheUserDetails) {
        const balance = convertSharesToAssets(
          trancheDetail.shares,
          trancheDetail.tranche.balance,
          trancheDetail.tranche.shares
        )

        const balanceNum = parseFloat(balance)
        const depositsNum = parseFloat(trancheDetail.totalAcceptedDeposits)
        const withdrawalsNum = parseFloat(
          trancheDetail.totalAcceptedWithdrawnAmount
        )
        const yieldEarned = balanceNum - depositsNum + withdrawalsNum

        const trancheData: LiteModeTrancheData = {
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
        }

        totalBalance += balanceNum
        totalYieldEarned += yieldEarned
        tranches.push(trancheData)
        allTranches.push(trancheData)
      }

      pools.push({
        poolId: poolDetail.lendingPool.id,
        poolName: poolDetail.lendingPool.name,
        isStopped: poolDetail.lendingPool.isStopped ?? false,
        totalAcceptedDeposits: poolDetail.totalAcceptedDeposits,
        totalAcceptedWithdrawnAmount: poolDetail.totalAcceptedWithdrawnAmount,
        userLoyaltyRewards: poolDetail.userLoyaltyRewards,
        tranches,
      })
    }
  }

  // Process user locks
  const userLocks: LiteModeUserLock[] = []
  if (rawData.userLockDepositsInfo?.userLocks) {
    for (const lock of rawData.userLockDepositsInfo.userLocks) {
      userLocks.push({
        id: lock.id,
        ksuAmount: lock.ksuAmount,
        rKSUAmount: lock.rKSUAmount,
        startTimestamp: parseInt(lock.startTimestamp),
        endTimestamp: parseInt(lock.endTimestamp),
        lockPeriodId: lock.lockPeriod.id,
        lockPeriodDuration: lock.lockPeriod.lockPeriod,
        rKSUMultiplier: lock.lockPeriod.rKSUMultiplier,
        ksuBonusMultiplier: lock.lockPeriod.ksuBonusMultiplier,
      })
    }
  }

  // Process lock deposits info
  const lockDepositsInfo: LiteModeLockDepositsInfo | null =
    rawData.userLockDepositsInfo
      ? {
          ksuLockedAmount: rawData.userLockDepositsInfo.ksuLockedAmount,
          rKSUAmount: rawData.userLockDepositsInfo.rKSUAmount,
          totalKsuBonusAmount: rawData.userLockDepositsInfo.totalKsuBonusAmount,
          feesClaimed: rawData.userLockDepositsInfo.feesClaimed,
        }
      : null

  // Process system variables
  const systemVariables: LiteModeSystemVariables | null =
    rawData.systemVariables
      ? {
          ksuPrice: rawData.systemVariables.ksuEpochTokenPrice,
          ksuPriceDecimals: 18, // KSU price is stored with 18 decimals
          epochDuration: rawData.systemVariables.epochDuration,
          performanceFee: rawData.systemVariables.performanceFee,
        }
      : null

  return {
    userId: rawData.user?.id ?? userAddress,
    totalUserLoyaltyRewards: rawData.user?.totalUserLoyaltyRewards ?? '0',
    pools,
    allTranches,
    totalBalance,
    totalYieldEarned,
    userLocks,
    lockDepositsInfo,
    systemVariables,
  }
}

type UseLiteModeSubgraphOptions = {
  enabled?: boolean
}

/**
 * Hook for fetching all Lite mode data from the subgraph in a single query.
 *
 * This replaces ~15 sequential RPC calls with 1 subgraph query, including:
 * - User portfolio data (pools, tranches, balances)
 * - User KSU locks
 * - User lock deposits info (staked KSU, rKSU, bonuses)
 * - System variables (KSU price, epoch duration)
 *
 * The only data that still needs RPC calls after this:
 * - Token balances (KSU, USDC) - real-time on-chain state
 * - Claimable rewards - computed from current block state
 *
 * @example
 * const { liteModeData, isLoading } = useLiteModeSubgraph()
 *
 * // Access portfolio data
 * const totalBalance = liteModeData?.totalBalance ?? 0
 *
 * // Access user locks
 * liteModeData?.userLocks.forEach(lock => console.log(lock.ksuAmount))
 *
 * // Access KSU price
 * const ksuPrice = liteModeData?.systemVariables?.ksuPrice
 */
export const useLiteModeSubgraph = (options?: UseLiteModeSubgraphOptions) => {
  const { currentChainId, chainConfig } = useChain()
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const graphClient = useMemo(() => {
    if (!chainConfig.subgraphUrl) return null
    return new GraphQLClient(chainConfig.subgraphUrl)
  }, [chainConfig.subgraphUrl])

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled && address && currentChainId && graphClient
      ? ['liteModeSubgraph', currentChainId, address.toLowerCase()]
      : null,
    async ([_, __chainId, userAddress]): Promise<LiteModeData> => {
      if (!graphClient) throw new Error('GraphQL client not ready')

      const result = await graphClient.request<LiteModeQueryResult>(
        liteModeQuery,
        { userAddress }
      )

      return processLiteModeData(result, userAddress)
    },
    {
      dedupingInterval: FIVE_MINUTES,
      keepPreviousData: true,
      revalidateIfStale: true,
    }
  )

  return {
    liteModeData: data,
    error,
    isLoading: enabled && isLoading,
    isValidating,
    updateLiteModeData: mutate,
  }
}

export default useLiteModeSubgraph
