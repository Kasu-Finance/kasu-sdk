import useSWRImmutable from 'swr/immutable'
import { useAccount } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'

const useCurrentEpochFtdAmount = (
  lendingPoolId: string,
  currentEpoch: string
) => {
  const sdk = useSdk()

  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWRImmutable(
    account.address && sdk
      ? [
          `currentEpochFtdAmount/${lendingPoolId}/${currentEpoch}`,
          account.address,
          sdk,
        ]
      : null,
    async ([_, userAddress, sdk]) => {
      const ftdAmountMap = await sdk.UserLending.getCurrentEpochFtdAmount(
        lendingPoolId,
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
