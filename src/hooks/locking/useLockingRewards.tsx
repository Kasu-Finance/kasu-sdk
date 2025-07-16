import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useLockingRewards = () => {
  const sdk = useKasuSDK()

  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk ? ['lockingRewards', account.address, sdk] : null,
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
