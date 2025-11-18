import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useEarnedBonusLockingAmount = () => {
  const { address } = usePrivyAuthenticated()

  const sdk = useSdk()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk ? ['earnedBonusLockingAmount', address, sdk] : null,
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
