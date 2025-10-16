import useSWRImmutable from 'swr/immutable'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useCurrentEpochDepositedAmount = (lendingPoolIds: string | string[]) => {
  const sdk = useSdk()

  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWRImmutable(
    address && sdk
      ? [
          `currentEpochDepositedAmount/${Array.isArray(lendingPoolIds) ? lendingPoolIds.join(',') : lendingPoolIds}`,
          address,
          sdk,
        ]
      : null,
    async ([_, userAddress, sdk]) => {
      const amountMap = await sdk.UserLending.getCurrentEpochDepositedAmount(
        Array.isArray(lendingPoolIds) ? lendingPoolIds : [lendingPoolIds],
        userAddress.toLowerCase()
      )

      return amountMap
    }
  )

  return {
    currentEpochDepositedAmount: data,
    error,
    isLoading,
    updateCurrentEpochDepositedAmount: mutate,
  }
}

export default useCurrentEpochDepositedAmount
