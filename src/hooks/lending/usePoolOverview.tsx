import { PoolOverview } from '@kasufinance/kasu-sdk'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'

const usePoolOverview = (poolId?: string) => {
  const { currentChainId } = useChain()

  const { data, isLoading, error } = useSWR(
    poolId ? ['poolOverview', currentChainId, poolId] : null,
    async () => {
      const res = await fetch(`/api/pools?chainId=${currentChainId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to load pools (${res.status})`)
      }

      const pools: PoolOverview[] = await res.json()

      // Filter to find the specific pool
      const pool = pools.find(
        (p) => p.id.toLowerCase() === poolId?.toLowerCase()
      )

      return pool ? [pool] : []
    }
  )

  return {
    data,
    error,
    isLoading,
  }
}

export default usePoolOverview
