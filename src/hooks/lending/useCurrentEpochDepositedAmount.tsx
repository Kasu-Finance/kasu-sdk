import useSWRImmutable from 'swr/immutable'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCurrentEpochDepositedAmount = (lendingPoolIds: string | string[]) => {
  const sdk = useKasuSDK()

  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWRImmutable(
    account.address && sdk
      ? [
          `currentEpochDepositedAmount/${Array.isArray(lendingPoolIds) ? lendingPoolIds.join(',') : lendingPoolIds}`,
          account.address,
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
