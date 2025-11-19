import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useEarnedRKsu = () => {
  const { address } = usePrivyAuthenticated()

  const sdk = useSdk()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk ? ['earnedRKsu', address, sdk] : null,
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
