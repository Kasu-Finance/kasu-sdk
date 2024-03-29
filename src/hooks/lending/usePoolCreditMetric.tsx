import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const usePoolCreditMetric = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchPoolCreditMetric = async () => {
    const data = await sdk.DataService.getPoolCreditMetrics([poolId])

    if (!data?.length) {
      throw new Error('No data available for pool credit metric')
    }

    return data
  }

  const { data, error } = useSWR(
    poolId ? `getPoolCreditMetrics/${poolId}` : null,
    fetchPoolCreditMetric,
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default usePoolCreditMetric
