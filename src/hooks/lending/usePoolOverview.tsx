import useSWRImmutable from 'swr/immutable'

import useKasuSDK from '@/hooks/useKasuSDK'

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

  const { data, error } = useSWRImmutable(
    `poolOverview/${poolId}`,
    fetchPoolOverview
  )

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default usePoolOverview
