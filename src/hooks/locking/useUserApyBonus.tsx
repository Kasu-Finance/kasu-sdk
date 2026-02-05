import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useUserApyBonus = () => {
  const sdk = useSdk()
  const { currentChainId: chainId } = useChain()
  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk && chainId
      ? ['userApyBonus', chainId, address.toLowerCase()]
      : null,
    async ([_, __chainId, userAddress]) => {
      if (!sdk) throw new Error('SDK not ready')
      return await sdk.UserLending.getUserApyBonus(userAddress)
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    apyBonus: data,
    error,
    isLoading,
    updateApyBonus: mutate,
  }
}

export default useUserApyBonus
