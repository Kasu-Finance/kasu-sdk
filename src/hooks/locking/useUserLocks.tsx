import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

type UseUserLocksOptions = {
  enabled?: boolean
}

const useUserLocks = (options?: UseUserLocksOptions) => {
  const sdk = useSdk()
  const chainId = useChainId()
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const { data, error, isLoading, mutate } = useSWR(
    enabled && address && sdk && chainId
      ? ['userLocks', chainId, address.toLowerCase()]
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
