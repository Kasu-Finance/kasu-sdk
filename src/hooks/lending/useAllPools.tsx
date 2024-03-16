import { PoolDetailSection } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { convertToPoolDetails, convertToPoolTraction } from '@/utils'

interface UsePoolOverviewReturn {
  data: {
    poolDetails: PoolDetailSection
    poolTraction: PoolDetailSection
  } | null
  error: any
  isLoading: boolean
}

const usePoolOverview = (poolId: string): UsePoolOverviewReturn => {
  const sdk = useKasuSDK()

  const fetchPoolOverview = async (): Promise<{
    poolDetails: PoolDetailSection
    poolTraction: PoolDetailSection
  } | null> => {
    const result = await sdk.DataService.getPoolOverview(poolId)

    if (!result || !result.length) {
      console.warn('Received empty data for poolOverview')
      return null
    }

    const poolOverviewData = result[0]
    const poolDetails = convertToPoolDetails(poolOverviewData)
    const poolTraction = convertToPoolTraction(poolOverviewData)

    return { poolDetails, poolTraction }
  }

  const { data, error } = useSWR(
    poolId ? `poolOverview/${poolId}` : null,
    fetchPoolOverview
  )

  return {
    data: data || null,
    error,
    isLoading: !data && !error && data !== null,
  }
}

export default usePoolOverview
