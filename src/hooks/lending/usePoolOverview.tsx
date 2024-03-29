import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePoolOverview = (poolId?: string) => {
  const sdk = useKasuSDK()

  const fetchPoolOverview = async () => {
    const argument = poolId ? [poolId] : undefined
    const poolOverview = await sdk.DataService.getPoolOverview(argument)

    if (!poolOverview?.length) {
      throw new Error('No pool overview data found')
    }

    return poolOverview
  }

  const { data, error } = useSWR(`poolOverview/${poolId}`, fetchPoolOverview)

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default usePoolOverview
