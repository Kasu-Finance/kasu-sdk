import { PoolOverview } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePoolOverview = (poolId?: string) => {
  const sdk = useKasuSDK()

  const fetchPoolOverview = async (): Promise<PoolOverview[] | null> => {
    const poolOverviewData = await sdk.DataService.getPoolOverview(poolId)

    if (!poolOverviewData.length) {
      console.warn('Received empty data for poolOverview')
      return null
    }

    return poolOverviewData
  }

  const { data, error } = useSWR(`poolOverview/${poolId}`, fetchPoolOverview)

  return {
    data: data || null,
    error,
    isLoading: !data && !error && data !== null,
  }
}

export default usePoolOverview
