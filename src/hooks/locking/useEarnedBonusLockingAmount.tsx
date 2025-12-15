import useUserLockDepositsInfo from '@/hooks/locking/useUserLockDepositsInfo'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useEarnedBonusLockingAmount = () => {
  const { address } = usePrivyAuthenticated()

  const { userLockDepositsInfo, error, isLoading, updateUserLockDepositsInfo } =
    useUserLockDepositsInfo()

  return {
    totalLaunchBonus: address
      ? userLockDepositsInfo?.totalKsuBonusAmount
      : undefined,
    error,
    isLoading,
    updateEarnedBonusLockingAmount: updateUserLockDepositsInfo,
  }
}

export default useEarnedBonusLockingAmount
