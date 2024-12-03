import useSWR from 'swr'

import { getPoolOverview } from '@/app/_requests/pools'

const usePoolOverview = (poolId?: string) => {
  const poolQuery = poolId ? `?id=${poolId}` : ''

  const { data, isLoading, error } = useSWR(
    `/api/pools${poolQuery}`,
    getPoolOverview
  )

  return {
    data,
    error,
    isLoading,
  }
}

export default usePoolOverview
