import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCurrentFtdBalance = (poolId: string) => {
  const sdk = useKasuSDK()

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
