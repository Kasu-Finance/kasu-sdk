import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useUserApyBonus = () => {
  const sdk = useSdk()
  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk ? ['userApyBonus', address, sdk] : null,
    async ([_, userAddress, sdk]) =>
      sdk.UserLending.getUserApyBonus(userAddress)
  )

  return {
    apyBonus: data,
    error,
    isLoading,
    updateApyBonus: mutate,
  }
}

export default useUserApyBonus
