import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'

const useEarnedBonusLockingAmount = () => {
  const account = useAccount()

  const sdk = useSdk()

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
