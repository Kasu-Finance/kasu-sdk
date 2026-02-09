import { PoolRepayment } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'

/**
 * Hook to fetch repayment data for a specific pool.
 * The SDK's getRepayments() now uses poolMetadataMapping internally to match
 * subgraph pool IDs with Directus pool IDs on non-Base chains.
 *
 * @param poolId - The pool address on the current chain
 * @returns The repayment data and loading state
 */
const usePoolRepayment = (poolId: string | undefined) => {
  const sdk = useSdk()
  const { currentChainId, chainConfig } = useChain()

  // Map pool ID to Base pool ID for finding the repayment in the returned array
  const poolMetadataMapping = chainConfig.poolMetadataMapping
  const lookupPoolId = poolId
    ? (poolMetadataMapping?.[poolId.toLowerCase()] ?? poolId)
    : undefined

  const { data, isLoading, error } = useSWR<PoolRepayment | undefined>(
    sdk && currentChainId && lookupPoolId
      ? ['poolRepayment', currentChainId, lookupPoolId]
      : null,
    async () => {
      if (!sdk) throw new Error('SDK not ready')
      const repayments = await sdk.DataService.getRepayments()

      // Find repayment using mapped Base pool ID
      return repayments.find(
        (repayment) =>
          repayment.poolIdFK.toLowerCase() === lookupPoolId?.toLowerCase()
      )
    },
    {
      revalidateIfStale: false,
    }
  )

  return {
    repayment: data,
    isLoading,
    error,
  }
}

export default usePoolRepayment
