import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useUserLocks = () => {
  const sdk = useSdk()
  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk ? ['userLocks', address, sdk] : null,
    async ([_, userAddress, sdk]) => sdk.Locking.getUserLocks(userAddress),
    {
      keepPreviousData: true,
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
