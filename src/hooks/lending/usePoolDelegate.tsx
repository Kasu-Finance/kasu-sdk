import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePoolDelegate = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchPoolDelegate = async () => {
    const result = await sdk.DataService.getPoolDelegateProfileAndHistory([
      poolId,
    ])

    console.warn('fetchPoolDelegate', result)

    if (!result?.length) {
      throw new Error('No data available for this pool.')
    }

    return result
  }

  const { data, error } = useSWR(
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
