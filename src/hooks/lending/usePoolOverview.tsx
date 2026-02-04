import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'

import { getPoolOverview } from '@/app/_requests/pools'

const usePoolOverview = (poolId?: string) => {
  const { currentChainId } = useChain()

  const { data, isLoading, error } = useSWR(
    ['poolOverview', currentChainId, poolId ?? 'all'],
    () => getPoolOverview(poolId, currentChainId)
  )

  return {
    data,
    error,
    isLoading,
  }
}

export default usePoolOverview
