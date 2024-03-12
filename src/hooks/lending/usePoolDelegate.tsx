import { PoolDelegateProfileAndHistory } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { convertToPoolDelegate } from '@/utils'

import { PoolMetric } from '@/types/poolDetails'

const usePoolDelegate = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetcher = async (): Promise<PoolMetric[] | null> => {
    if (!poolId) return null

    try {
      const result = await sdk.DataService.getPoolDelegateProfileAndHistory([
        poolId,
      ])
      if (result?.length) {
        const delegateProfile: PoolDelegateProfileAndHistory = result[0]

        const metrics: PoolMetric[] = convertToPoolDelegate(delegateProfile)

        return metrics
      } else {
        console.warn('Received unexpected data format or empty result:', result)
        return null
      }
    } catch (error) {
      console.error('Failed to fetch PoolDelegateProfileAndHistory', error)
      return null
    }
  }

  const { data, error, isValidating } = useSWR<PoolMetric[] | null>(
    `poolDelegateProfileAndHistory/${poolId}`,
    fetcher
  )

  return {
    data,
    error,
    isLoading: isValidating,
  }
}

export default usePoolDelegate
