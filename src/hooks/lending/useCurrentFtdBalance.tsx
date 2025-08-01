import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'

const useCurrentFtdBalance = (poolId: string) => {
  const sdk = useSdk()

  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk
      ? ['currentFtdBalance', account.address, poolId, sdk]
      : null,
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
