'use client'

import { useMemo } from 'react'

import usePortfolioSubgraphContext from '@/hooks/context/usePortfolioSubgraphContext'
import { UserTrancheData } from '@/hooks/portfolio/useUserPortfolioSubgraph'

/**
 * Balance data structure compatible with SDK's UserTrancheBalance type.
 * This allows gradual migration from RPC-based hook to subgraph-based hook.
 */
export type SubgraphTrancheBalanceData = {
  userId: string
  address: string
  trancheId: string
  /** User's balance in this tranche (in assets) */
  balance: string
  /** Computed yield earned (balance - deposits + withdrawals) */
  yieldEarned: number
  /**
   * Available to withdraw - NOTE: This requires on-chain call for accurate value.
   * From subgraph, we use the balance as an approximation.
   * For actual withdrawals, call maxWithdraw() on-chain.
   */
  availableToWithdraw: string
}

/**
 * Tranche with balance data attached, compatible with existing component patterns.
 */
export type TrancheWithSubgraphBalance<T> = T & {
  balanceData: SubgraphTrancheBalanceData
  /** Additional subgraph data */
  subgraphData: UserTrancheData
}

/**
 * Hook to get user's tranche balance data from the subgraph context.
 *
 * This is a drop-in replacement for useUserLendingTrancheBalance that uses
 * the subgraph data instead of making per-tranche RPC calls.
 *
 * IMPORTANT: Must be used within a PortfolioSubgraphProvider.
 *
 * @param poolId - The pool ID to get balances for
 * @param tranches - Array of tranches (must have `id` field)
 *
 * @example
 * // Replace:
 * const { userLendingTrancheBalance } = useUserLendingTrancheBalance(poolId, tranches)
 *
 * // With:
 * const { userLendingTrancheBalance } = useUserLendingTrancheBalanceSubgraph(poolId, tranches)
 */
const useUserLendingTrancheBalanceSubgraph = <T extends { id: string }>(
  poolId: string,
  tranches: T[]
): {
  userLendingTrancheBalance: TrancheWithSubgraphBalance<T>[] | undefined
  error: Error | undefined
  isLoading: boolean
} => {
  const { portfolioData, isLoading, error } = usePortfolioSubgraphContext()

  const userLendingTrancheBalance = useMemo(() => {
    if (!portfolioData) return undefined

    const poolIdLower = poolId.toLowerCase()

    // Create a map of tranche data by ID for quick lookup
    const trancheDataMap = new Map<string, UserTrancheData>()
    for (const tranche of portfolioData.allTranches) {
      if (tranche.poolId.toLowerCase() === poolIdLower) {
        trancheDataMap.set(tranche.trancheId.toLowerCase(), tranche)
      }
    }

    // Map tranches with their balance data
    return tranches.map((tranche) => {
      const trancheIdLower = tranche.id.toLowerCase()
      const subgraphData = trancheDataMap.get(trancheIdLower)

      const balanceData: SubgraphTrancheBalanceData = {
        userId: portfolioData.userId,
        address: tranche.id,
        trancheId: tranche.id,
        balance: subgraphData?.balance ?? '0',
        yieldEarned: subgraphData?.yieldEarned ?? 0,
        // Use balance as approximation; actual maxWithdraw needs on-chain call
        availableToWithdraw: subgraphData?.balance ?? '0',
      }

      return {
        ...tranche,
        balanceData,
        subgraphData: subgraphData ?? {
          trancheId: tranche.id,
          trancheName: '',
          poolId,
          orderId: 0,
          shares: '0',
          balance: '0',
          totalAcceptedDeposits: '0',
          totalAcceptedWithdrawnAmount: '0',
          totalPendingDepositAmount: '0',
          yieldEarned: 0,
          trancheTotalBalance: '0',
          trancheTotalShares: '0',
          fixedTermLocks: [],
        },
      }
    })
  }, [portfolioData, poolId, tranches])

  return {
    userLendingTrancheBalance,
    error,
    isLoading,
  }
}

export default useUserLendingTrancheBalanceSubgraph
