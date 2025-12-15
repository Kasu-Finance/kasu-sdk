import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useUserBonusData = () => {
  const sdk = useSdk()
  const chainId = useChainId()
  const { address } = usePrivyAuthenticated()
  const addressLower = address?.toLowerCase()

  const { data, error, isLoading, mutate } = useSWR(
    addressLower && sdk && chainId
      ? ['userBonusData', chainId, addressLower]
      : null,
    async ([_, __chainId, userAddress]) => {
      if (!sdk) throw new Error('SDK not ready')
      return await sdk.Locking.getUserBonusData(userAddress)
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    userBonus: data,
    error,
    isLoading,
    updateUserBonus: mutate,
  }
}

export default useUserBonusData
