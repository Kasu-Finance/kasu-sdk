import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'

const useEarnedRKsu = () => {
  const account = useAccount()

  const sdk = useSdk()

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
