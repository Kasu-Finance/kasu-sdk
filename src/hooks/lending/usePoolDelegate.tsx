import { PoolDelegateProfileAndHistory } from '@solidant/kasu-sdk/src/services/DataService/types'
import useSWR, { KeyedMutator } from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

type PoolDelegateReturnType<T> = {
  data: T | undefined
  error: any
  mutate: KeyedMutator<T>
  isLoading: boolean
}

function usePoolDelegate(
  poolId: string
): PoolDelegateReturnType<PoolDelegateProfileAndHistory>
function usePoolDelegate(
  poolId?: undefined
): PoolDelegateReturnType<PoolDelegateProfileAndHistory[]>

function usePoolDelegate(poolId?: string | undefined): unknown {
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
