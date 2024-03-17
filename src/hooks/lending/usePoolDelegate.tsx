import { PoolMetric } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { convertToPoolDelegate } from '@/utils'

interface UsePoolDelegateReturnType {
  data: PoolMetric[] | null
  error: any
  isLoading: boolean
}

const usePoolDelegate = (poolId: string): UsePoolDelegateReturnType => {
  const sdk = useKasuSDK()

  const fetchPoolDelegate = async (): Promise<PoolMetric[] | null> => {
    const result = await sdk.DataService.getPoolDelegateProfileAndHistory([
      poolId,
    ])

    if (!result?.length) {
      console.warn('Received empty data for poolDelegateProfileAndHistory')
      return null
    }

    const delegateData = convertToPoolDelegate(result[0])
    return delegateData
  }

  const { data, error } = useSWR<PoolMetric[] | null>(
    poolId ? `poolDelegateProfileAndHistory/${poolId}` : null,
    fetchPoolDelegate
  )

  return {
    data: data || null,
    error,
    isLoading: !data && !error && data !== null,
  }
}

export default usePoolDelegate
