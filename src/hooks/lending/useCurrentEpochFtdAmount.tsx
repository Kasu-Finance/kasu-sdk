import useSWRImmutable from 'swr/immutable'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCurrentEpochFtdAmount = (
  lendingPoolId: string,
  currentEpoch: string,
  trancheId: string
) => {
  const sdk = useKasuSDK()

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
    currentEpochFtdAmount: data?.get(trancheId),
    error,
    isLoading,
    updateCurrentEpochFtdAmount: mutate,
  }
}

export default useCurrentEpochFtdAmount
