import { PoolMetric } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { convertToPoolDelegate } from '@/utils'

const usePoolDelegate = (poolId: string) => {
  const sdk = useKasuSDK()

  const { data, error } = useSWR<PoolMetric[] | null>(
    poolId ? `poolDelegateProfileAndHistory/${poolId}` : null,
    async () => {
      try {
        const result = await sdk.DataService.getPoolDelegateProfileAndHistory([
          poolId,
        ])

        if (!result?.length) {
          throw new Error('Received empty data')
        }

        const delegateData = result[0]
        return convertToPoolDelegate(delegateData)
      } catch (error) {
        console.error('Failed to fetch PoolDelegateProfileAndHistory', error)
        throw error
      }
    }
  )

  return {
    data: data || null,
    error,
    isLoading: !data && !error,
  }
}

export default usePoolDelegate
