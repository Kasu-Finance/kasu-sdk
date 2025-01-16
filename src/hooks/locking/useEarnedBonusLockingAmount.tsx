import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useEarnedBonusLockingAmount = () => {
  const { account } = useWeb3React()

  const sdk = useKasuSDK()

  const { data, error, isLoading, mutate } = useSWR(
    account && sdk ? ['earnedBonusLockingAmount', account, sdk] : null,
    async ([_, userAddress, sdk]) =>
      sdk.Locking.getUserTotalBonusAmount(userAddress)
  )
  return {
    totalLaunchBonus: data,
    error,
    isLoading,
    updateEarnedBonusLockingAmount: mutate,
  }
}

export default useEarnedBonusLockingAmount
