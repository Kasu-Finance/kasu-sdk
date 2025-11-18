import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useCurrentFtdBalance = (poolId: string) => {
  const sdk = useSdk()

  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk ? ['currentFtdBalance', address, poolId, sdk] : null,
    async ([_, userAddress, poolId, sdk]) =>
      await sdk.UserLending.getCurrentFtdBalance(poolId, userAddress),
    { fallbackData: new Map() }
  )

  return {
    currentFtdBalance: data,
    error,
    isLoading,
    updateCurrentFtdBalance: mutate,
  }
}

export default useCurrentFtdBalance
