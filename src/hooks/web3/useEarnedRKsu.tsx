import useUserLockDepositsInfo from '@/hooks/locking/useUserLockDepositsInfo'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useEarnedRKsu = () => {
  const { address } = usePrivyAuthenticated()

  const { userLockDepositsInfo, error, isLoading, updateUserLockDepositsInfo } =
    useUserLockDepositsInfo()

  return {
    rKsuAmount: address ? userLockDepositsInfo?.rKSUAmount : undefined,
    error,
    isLoading,
    updateEarnedRKsu: updateUserLockDepositsInfo,
  }
}

export default useEarnedRKsu
