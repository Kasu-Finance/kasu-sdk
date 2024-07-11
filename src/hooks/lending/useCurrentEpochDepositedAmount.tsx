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
    account
      ? [`currentEpochDepositedAmount/${lendingPoolId}/${trancheId}`, account]
      : null,
    async ([_, userAddress]) =>
      sdk.UserLending.getCurrentEpochDepositedAmount(
        lendingPoolId,
        trancheId,
        userAddress.toLowerCase()
      )
  )

  return {
    currentEpochDepositedAmount: '60' || data,
    error,
    isLoading,
    updateCurrentEpochDepositedAmount: mutate,
  }
}

export default useCurrentEpochDepositedAmount
