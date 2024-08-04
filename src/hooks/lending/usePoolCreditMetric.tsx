import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const usePoolCreditMetric = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchPoolCreditMetric = async () => {
    const data = await sdk.DataService.getPoolCreditMetrics()
    if (!data?.length)
      throw new Error('No data available for pool credit metric')
    const filteredData = data
      .filter((item) => item.poolIdFK === poolId)
      .map((data) => {
        const unit =
          data.keyCreditMetric === 'Advance Rate • LTV Ratio' ? '%' : 'x'

        return { ...data, unit }
      })

    if (!filteredData.length)
      throw new Error(`No data available for pool ID: ${poolId}`)
    return filteredData
  }

  const { data, error, mutate } = useSWR(
    `getPoolCreditMetrics/${poolId}`,
    fetchPoolCreditMetric,
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    data,
    error,
    isLoading: !data && !error,
    mutate,
  }
}

export default usePoolCreditMetric
