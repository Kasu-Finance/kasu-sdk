import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePoolDelegate = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchPoolDelegate = async () => {
    const result = await sdk.DataService.getPoolDelegateProfileAndHistory()

    if (!result?.length) {
      throw new Error('No data available.')
    }

    return result
  }

  const { data, error, mutate } = useSWR(
    'poolDelegateProfileAndHistory',
    fetchPoolDelegate
  )

  let customError = error
  let filteredPoolDelegate = data
    ? data.find((item) => item.poolIdFK === poolId)
    : null

  filteredPoolDelegate =
    filteredPoolDelegate === undefined ? null : filteredPoolDelegate

  if (data && !filteredPoolDelegate) {
    customError = new Error(`No data available for pool ID: ${poolId}`)
    console.error(`No data available for pool ID: ${poolId}`)
  }

  return {
    data: filteredPoolDelegate,
    error: customError,
    isLoading: !filteredPoolDelegate && !customError,
    // Expose mutate for refetching or cache updating if needed
    mutate,
  }
}

export default usePoolDelegate
