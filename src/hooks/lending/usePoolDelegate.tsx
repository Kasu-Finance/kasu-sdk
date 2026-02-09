import { PoolDelegateProfileAndHistory } from '@kasufinance/kasu-sdk'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'

/**
 * Hook to fetch delegate data for a specific pool.
 * Applies pool metadata mapping to look up delegate using Base pool address.
 *
 * @param poolId - The pool address on the current chain
 * @returns The delegate data and loading state
 */
const usePoolDelegate = (poolId: string | undefined) => {
  const sdk = useSdk()
  const { currentChainId, chainConfig } = useChain()

  // Map pool ID to Base pool ID for Directus lookup
  const poolMetadataMapping = chainConfig.poolMetadataMapping
  const lookupPoolId = poolId
    ? (poolMetadataMapping?.[poolId.toLowerCase()] ?? poolId)
    : undefined

  const {
    data: delegates,
    isLoading,
    error,
  } = useSWR(
    sdk && currentChainId ? ['poolDelegates', currentChainId] : null,
    async () => {
      if (!sdk) throw new Error('SDK not ready')
      return sdk.DataService.getPoolDelegateProfileAndHistory()
    },
    {
      revalidateIfStale: false,
    }
  )

  // Find delegate for this pool (using mapped Base pool ID)
  // Fall back to first delegate if no specific match (same logic as usePoolsWithDelegate)
  const matchedDelegate = delegates?.find((d) =>
    d.otherKASUPools.some(
      (p) => p.id.toLowerCase() === lookupPoolId?.toLowerCase()
    )
  )
  const delegate = matchedDelegate ?? delegates?.[0]

  return {
    delegate,
    isLoading,
    error,
  }
}

/**
 * Creates a PoolDelegateProfileAndHistory object from pool overview data.
 * Used as fallback when delegate data isn't available from Directus.
 */
export const createFallbackDelegate = (pool: {
  id: string
  assetClass: string
  poolName: string
  isActive: boolean
  isOversubscribed: boolean
  loanFundsOriginated?: string
  activeLoans?: string
  loansUnderManagement?: string
}): PoolDelegateProfileAndHistory => ({
  id: pool.id,
  delegateLendingHistory: 0,
  assetClasses: pool.assetClass,
  otherKASUPools: [
    {
      id: pool.id,
      name: pool.poolName,
      isActive: pool.isActive,
      isOversubscribed: pool.isOversubscribed,
    },
  ],
  totalLoanFundsOriginated: parseFloat(pool.loanFundsOriginated || '0') || 0,
  totalLoansOriginated: parseInt(pool.activeLoans || '0') || 0,
  loansUnderManagement: parseFloat(pool.loansUnderManagement || '0') || 0,
  historicLossRate: 0,
})

export default usePoolDelegate
