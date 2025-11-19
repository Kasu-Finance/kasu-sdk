import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useLockingRewards = () => {
  const sdk = useSdk()

  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk ? ['lockingRewards', address, sdk] : null,
    async ([_, userAddress, sdk]) => sdk.Locking.getLockingRewards(userAddress)
  )

  return {
    lockingRewards: data,
    error,
    isLoading,
    updateLockingRewards: mutate,
  }
}

export default useLockingRewards
