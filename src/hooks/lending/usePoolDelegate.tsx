import { PoolDelegateProfileAndHistory } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePoolDelegate = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchPoolDelegate = async (): Promise<
    PoolDelegateProfileAndHistory[] | null
  > => {
    const result = await sdk.DataService.getPoolDelegateProfileAndHistory([
      poolId,
    ])

    if (!result?.length) {
      console.warn('Received empty data for poolDelegateProfileAndHistory')
      return null
    }

    return result
  }

  const { data, error } = useSWR<PoolDelegateProfileAndHistory[] | null>(
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
