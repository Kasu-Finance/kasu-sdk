import useSWRImmutable from 'swr/immutable'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCurrentEpochDepositedAmount = (lendingPoolId: string) => {
  const sdk = useKasuSDK()

  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWRImmutable(
    account.address && sdk
      ? [`currentEpochDepositedAmount/${lendingPoolId}`, account.address, sdk]
      : null,
    async ([_, userAddress, sdk]) => {
      const amountMap = await sdk.UserLending.getCurrentEpochDepositedAmount(
        lendingPoolId,
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
