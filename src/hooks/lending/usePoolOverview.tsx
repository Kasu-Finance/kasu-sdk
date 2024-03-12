import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { convertToPoolDetails, convertToPoolTraction } from '@/utils'

import { PoolDetailSection } from '@/types/poolDetails'

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

  const fetcher = async (): Promise<{
    poolDetails: PoolDetailSection
    poolTraction: PoolDetailSection
  } | null> => {
    if (!poolId) return null

    try {
      const result = await sdk.DataService.getPoolOverview(poolId)

      if (result?.length) {
        const data = result[0]
        const poolDetails = convertToPoolDetails(data)
        const poolTraction = convertToPoolTraction(data)

        return { poolDetails, poolTraction }
      } else {
        console.warn('Received unexpected data format or empty result:', result)
        return null
      }
    } catch (error) {
      console.error('Failed to fetch PoolOverview', error)
      return null
    }
  }

  const { data, error, isValidating } = useSWR<{
    poolDetails: PoolDetailSection
    poolTraction: PoolDetailSection
  } | null>(`poolOverview/${poolId}`, fetcher)

  return {
    data: data || null,
    error,
    isLoading: isValidating,
  }
}

export default usePoolOverview
