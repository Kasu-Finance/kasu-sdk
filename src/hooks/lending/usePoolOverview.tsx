import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { TimeConversions } from '@/utils'

const usePoolOverview = (poolId?: string) => {
  const sdk = useKasuSDK()

  const fetchPoolOverview = async () => {
    const argument = poolId ? [poolId] : undefined
    const data = await sdk.DataService.getPoolOverview(argument)

    if (!data?.length) {
      throw new Error('No pool overview data found')
    }

    return data
  }

  const { data, error } = useSWR(`poolOverview/${poolId}`, fetchPoolOverview, {
    dedupingInterval: TimeConversions.SECONDS_PER_MINUTE * 60,
    refreshInterval: TimeConversions.SECONDS_PER_MINUTE * 60,
  })

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default usePoolOverview
