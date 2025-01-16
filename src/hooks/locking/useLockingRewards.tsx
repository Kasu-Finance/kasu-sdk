import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useLockingRewards = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account && sdk ? ['lockingRewards', account, sdk] : null,
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
