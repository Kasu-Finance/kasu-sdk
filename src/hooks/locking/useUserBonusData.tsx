import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useUserBonusData = () => {
  const sdk = useSdk()
  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk ? ['userBonus', address, sdk] : null,
    async ([_, userAddress, sdk]) => sdk.Locking.getUserBonusData(userAddress)
  )

  return {
    userBonus: data,
    error,
    isLoading,
    updateUserBonus: mutate,
  }
}

export default useUserBonusData
