import useUserLockDepositsInfo from '@/hooks/locking/useUserLockDepositsInfo'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useStakedKSU = () => {
  const { address } = usePrivyAuthenticated()

  const { userLockDepositsInfo, error, isLoading } = useUserLockDepositsInfo()

  return {
    stakedKSU: address ? userLockDepositsInfo?.ksuLockedAmount : undefined,
    error,
    isLoading,
  }
}

export default useStakedKSU
