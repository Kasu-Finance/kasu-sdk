import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useStakedKSU = () => {
  const { address } = usePrivyAuthenticated()

  const sdk = useSdk()

  const { data, error, isLoading } = useSWR(
    address && sdk ? ['stakedKasu', address, sdk] : null,
    async ([_, userAddress, sdk]) => sdk.Locking.getUserStakedKsu(userAddress)
  )

  return {
    stakedKSU: data,
    error,
    isLoading,
  }
}

export default useStakedKSU
