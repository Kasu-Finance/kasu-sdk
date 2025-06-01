import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useUserLocks = () => {
  const sdk = useKasuSDK()
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
