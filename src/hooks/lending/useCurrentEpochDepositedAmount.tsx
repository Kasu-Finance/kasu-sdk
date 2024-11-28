import { useWeb3React } from '@web3-react/core'
import useSWRImmutable from 'swr/immutable'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCurrentEpochDepositedAmount = (
  lendingPoolId: string,
  trancheId: string
) => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWRImmutable(
    account ? [`currentEpochDepositedAmount/${lendingPoolId}`, account] : null,
    async ([_, userAddress]) => {
      const amountMap = await sdk.UserLending.getCurrentEpochDepositedAmount(
        lendingPoolId,
        userAddress.toLowerCase()
      )

      return amountMap
    }
  )

  return {
    currentEpochDepositedAmount: data
      ? data.get(trancheId.toLowerCase()) ?? '0'
      : undefined,
    error,
    isLoading,
    updateCurrentEpochDepositedAmount: mutate,
  }
}

export default useCurrentEpochDepositedAmount
