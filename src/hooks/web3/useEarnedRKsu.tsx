import useUserLockDepositsInfo from '@/hooks/locking/useUserLockDepositsInfo'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

type UseEarnedRKsuOptions = {
  enabled?: boolean
}

const useEarnedRKsu = (options?: UseEarnedRKsuOptions) => {
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const { userLockDepositsInfo, error, isLoading, updateUserLockDepositsInfo } =
    useUserLockDepositsInfo({ enabled })

  return {
    rKsuAmount: address ? userLockDepositsInfo?.rKSUAmount : undefined,
    error,
    isLoading: enabled && isLoading,
    updateEarnedRKsu: updateUserLockDepositsInfo,
  }
}

export default useEarnedRKsu
