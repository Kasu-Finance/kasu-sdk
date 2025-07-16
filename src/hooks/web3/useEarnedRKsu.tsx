import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useEarnedRKsu = () => {
  const account = useAccount()

  const sdk = useKasuSDK()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk ? ['earnedRKsu', account.address, sdk] : null,
    async ([_, userAddress, sdk]) => sdk.Locking.getUserEarnedrKsu(userAddress)
  )

  return {
    rKsuAmount: data,
    error,
    isLoading,
    updateEarnedRKsu: mutate,
  }
}

export default useEarnedRKsu
