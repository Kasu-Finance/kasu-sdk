import { useWeb3React } from '@web3-react/core'
import useSWRImmutable from 'swr/immutable'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCurrentEpochFtdAmount = (
  lendingPoolId: string,
  currentEpoch: string,
  trancheId: string
) => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWRImmutable(
    account
      ? [`currentEpochFtdAmount/${lendingPoolId}/${currentEpoch}`, account]
      : null,
    async ([_, userAddress]) => {
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
