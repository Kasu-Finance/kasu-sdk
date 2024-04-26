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
  let filteredData = data ? data.find((item) => item.poolIdFK === poolId) : null

  filteredData = filteredData === undefined ? null : filteredData

  if (data && !filteredData) {
    customError = new Error(`No data available for pool ID: ${poolId}`)
    console.error(`No data available for pool ID: ${poolId}`)
  }

  return {
    data: filteredData,
    error: customError,
    isLoading: !filteredData && !customError,
    // Expose mutate for refetching or cache updating if needed
    mutate,
  }
}

export default usePoolDelegate
