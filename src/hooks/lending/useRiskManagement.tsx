import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useRiskManagement = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchRiskManagement = async () => {
    const data = await sdk.DataService.getRiskManagement()

    if (!data?.length) {
      throw new Error('No data available for this pool.')
    }

    return data
  }

  const { data, error, mutate } = useSWR(
    poolId ? `riskManagement/${poolId}` : null,
    fetchRiskManagement
  )

  let customError = error
  let filteredData = data
    ? data.find((item) => item.poolIdFK === poolId) || null
    : null

  filteredData = filteredData === undefined ? null : filteredData

  if (data && !filteredData) {
    customError = new Error(`No data available for pool ID: ${poolId}`)
    console.error(`No data available for pool ID: ${poolId}`)
  }

  return {
    data,
    error: customError,
    isLoading: !filteredData && !customError,
    mutate,
  }
}

export default useRiskManagement
