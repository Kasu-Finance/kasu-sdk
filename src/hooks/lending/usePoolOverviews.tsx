import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import useSWR from 'swr'

const usePoolOverviews = () => {
  const { data, error, isLoading } = useSWR('poolOverviews', async () => {
    const res = await fetch('/api/pools', {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to load pools (${res.status})`)
    }

    const pools: PoolOverview[] = await res.json()
    return pools
  })

  return {
    poolOverviews: data,
    error,
    isLoading,
  }
}

export default usePoolOverviews
