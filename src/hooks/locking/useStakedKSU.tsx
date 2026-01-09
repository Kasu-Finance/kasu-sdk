import useUserLockDepositsInfo from '@/hooks/locking/useUserLockDepositsInfo'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

type UseStakedKsuOptions = {
  enabled?: boolean
}

const useStakedKSU = (options?: UseStakedKsuOptions) => {
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const { userLockDepositsInfo, error, isLoading } = useUserLockDepositsInfo({
    enabled,
  })

  return {
    stakedKSU: address ? userLockDepositsInfo?.ksuLockedAmount : undefined,
    error,
    isLoading: enabled && isLoading,
  }
}

export default useStakedKSU
