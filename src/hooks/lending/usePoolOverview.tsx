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

  const { data, error } = useSWR(
    poolId ? `poolOverview/${poolId}` : null,
    async () => {
      const result = await sdk.DataService.getPoolOverview(poolId)

      if (!result?.length) {
        throw new Error('Received empty data')
      }

      const poolOverviewData = result[0]
      const poolDetails = convertToPoolDetails(poolOverviewData)
      const poolTraction = convertToPoolTraction(poolOverviewData)

      return { poolDetails, poolTraction }
    }
  )

  return {
    data: data || null,
    error,
    isLoading: !data && !error,
  }
}

export default usePoolOverview
