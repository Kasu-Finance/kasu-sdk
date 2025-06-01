import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useEarnedBonusLockingAmount = () => {
  const account = useAccount()

  const sdk = useKasuSDK()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk
      ? ['earnedBonusLockingAmount', account.address, sdk]
      : null,
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
