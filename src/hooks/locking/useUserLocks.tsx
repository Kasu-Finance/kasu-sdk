import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

type UseUserLocksOptions = {
  enabled?: boolean
}

const useUserLocks = (options?: UseUserLocksOptions) => {
  const sdk = useSdk()
  const { currentChainId } = useChain()
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const { data, error, isLoading, mutate } = useSWR(
    enabled && address && sdk && currentChainId
      ? ['userLocks', currentChainId, address.toLowerCase()]
      : null,
    async ([_, __chainId, userAddress]) => {
      if (!sdk) throw new Error('SDK not ready')
      return await sdk.Locking.getUserLocks(userAddress)
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    userLocks: data,
    error,
    isLoading: enabled && isLoading,
    updateUserLocks: mutate,
  }
}

export default useUserLocks
