import useSWRImmutable from 'swr/immutable'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useCurrentEpochFtdAmount = (
  lendingPoolIds: string | string[],
  currentEpoch: string
) => {
  const sdk = useSdk()

  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWRImmutable(
    address && sdk
      ? [
          `currentEpochFtdAmount/${Array.isArray(lendingPoolIds) ? lendingPoolIds.join(',') : lendingPoolIds}/${currentEpoch}`,
          address,
          sdk,
        ]
      : null,
    async ([_, userAddress, sdk]) => {
      const ftdAmountMap = await sdk.UserLending.getCurrentEpochFtdAmount(
        Array.isArray(lendingPoolIds) ? lendingPoolIds : [lendingPoolIds],
        userAddress.toLowerCase(),
        currentEpoch
      )

      return ftdAmountMap
    }
  )

  return {
    currentEpochFtdAmount: data,
    error,
    isLoading,
    updateCurrentEpochFtdAmount: mutate,
  }
}

export default useCurrentEpochFtdAmount
