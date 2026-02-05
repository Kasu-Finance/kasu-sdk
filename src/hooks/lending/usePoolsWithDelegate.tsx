import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'

import { PoolOverviewWithDelegate } from '@/types/page'

type UsePoolsWithDelegateOptions = {
  /** Only include active pools (default: true) */
  activePools?: boolean
  /** Only include oversubscribed pools (default: false) */
  oversubscribed?: boolean
}

/**
 * Hook to fetch pools with their delegate information.
 * Combines pool overviews with delegate profile data.
 * Use this for client-side fetching when server-side props
 * don't match the current chain.
 */
const usePoolsWithDelegate = (options?: UsePoolsWithDelegateOptions) => {
  const { activePools = true, oversubscribed = false } = options ?? {}

  const sdk = useSdk()
  const { currentChainId, chainConfig } = useChain()
  const { poolOverviews, isLoading: isPoolsLoading } = usePoolOverviews()

  // Pool metadata mapping maps current chain pool IDs to Base pool IDs (used in Directus)
  const poolMetadataMapping = chainConfig.poolMetadataMapping

  const { data: delegates, isLoading: isDelegatesLoading } = useSWR(
    sdk && currentChainId ? ['poolDelegates', currentChainId] : null,
    async () => {
      if (!sdk) throw new Error('SDK not ready')
      return sdk.DataService.getPoolDelegateProfileAndHistory()
    },
    {
      revalidateIfStale: false,
    }
  )

  // Combine pools with their delegates, applying filters
  // On non-Base chains, include pools even without delegates (delegate data uses Base pool IDs)
  const poolsWithDelegate = useMemo<PoolOverviewWithDelegate[]>(() => {
    if (!poolOverviews) return []
    // Wait for delegates to load before processing
    if (!delegates) return []

    return poolOverviews
      .filter((pool) => {
        const showActivePools = activePools ? pool.isActive : !pool.isActive
        const showOversubscribedPools = oversubscribed
          ? pool.isOversubscribed
          : !pool.isOversubscribed
        return showActivePools && showOversubscribedPools
      })
      .map((pool) => {
        // For non-Base chains, map pool ID to Base pool ID for delegate lookup
        // Delegate data uses Base pool IDs
        const lookupPoolId =
          poolMetadataMapping?.[pool.id.toLowerCase()] ?? pool.id

        const delegate = delegates.find((d) =>
          d.otherKASUPools.some(
            (p) => p.id.toLowerCase() === lookupPoolId.toLowerCase()
          )
        )

        // Include pool even without delegate (delegate field isn't used by Lite components)
        // Use first delegate as fallback if no specific match found
        return {
          ...pool,
          delegate: delegate ?? delegates[0],
        } as PoolOverviewWithDelegate
      })
  }, [
    poolOverviews,
    delegates,
    activePools,
    oversubscribed,
    poolMetadataMapping,
  ])

  return {
    poolsWithDelegate,
    isLoading: isPoolsLoading || isDelegatesLoading,
  }
}

export default usePoolsWithDelegate
