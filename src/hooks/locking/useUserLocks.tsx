import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useUserLocks = () => {
  const sdk = useSdk()
  const chainId = useChainId()
  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk && chainId
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
    isLoading,
    updateUserLocks: mutate,
  }
}

export default useUserLocks
