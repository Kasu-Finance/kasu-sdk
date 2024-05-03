import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePoolDelegate = (poolId?: string) => {
  const sdk = useKasuSDK()

  const fetchPoolDelegate = async () => {
    const results = await sdk.DataService.getPoolDelegateProfileAndHistory()
    if (!results?.length) {
      throw new Error('No data available.')
    }
    return results
  }

  const { data, error, mutate } = useSWR(
    'poolDelegateProfileAndHistory',
    fetchPoolDelegate
  )

  let filteredData = null
  let customError = error

  // Filter the results by poolId if provided, otherwise, return all results
  if (poolId && data) {
    filteredData = data.find((item) => item.poolIdFK === poolId)

    // Handling case when no matching data is found for the provided poolId
    if (!filteredData) {
      const errorMessage = `No data available for pool ID: ${poolId}`
      customError = new Error(errorMessage)
      console.error(errorMessage)
    }
  }

  return {
    data: filteredData || data,
    error: customError,
    isLoading: !data && !error,
    mutate,
  }
}

export default usePoolDelegate
