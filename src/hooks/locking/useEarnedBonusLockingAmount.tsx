import useUserLockDepositsInfo from '@/hooks/locking/useUserLockDepositsInfo'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

type UseEarnedBonusLockingAmountOptions = {
  enabled?: boolean
}

const useEarnedBonusLockingAmount = (
  options?: UseEarnedBonusLockingAmountOptions
) => {
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const { userLockDepositsInfo, error, isLoading, updateUserLockDepositsInfo } =
    useUserLockDepositsInfo({ enabled })

  return {
    totalLaunchBonus: address
      ? userLockDepositsInfo?.totalKsuBonusAmount
      : undefined,
    error,
    isLoading: enabled && isLoading,
    updateEarnedBonusLockingAmount: updateUserLockDepositsInfo,
  }
}

export default useEarnedBonusLockingAmount
