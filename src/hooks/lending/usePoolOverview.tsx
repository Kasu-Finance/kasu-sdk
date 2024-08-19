import useSWRImmutable from 'swr/immutable'

import getPoolOverview from '@/requests/poolOverview'

const usePoolOverview = (poolId?: string) => {
  const poolQuery = poolId ? `?id=${poolId}` : ''

  const { data, error } = useSWRImmutable(
    `/api/pools${poolQuery}`,
    getPoolOverview
  )

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default usePoolOverview
