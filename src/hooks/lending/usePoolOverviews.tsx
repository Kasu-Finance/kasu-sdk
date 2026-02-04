import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'

const usePoolOverviews = () => {
  const { currentChainId } = useChain()

  const { data, error, isLoading } = useSWR(
    ['poolOverviews', currentChainId],
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
      return pools
    }
  )

  return {
    poolOverviews: data,
    error,
    isLoading,
  }
}

export default usePoolOverviews
