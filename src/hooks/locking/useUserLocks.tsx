import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'

const useUserLocks = () => {
  const sdk = useSdk()
  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk ? ['userLocks', account.address, sdk] : null,
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
