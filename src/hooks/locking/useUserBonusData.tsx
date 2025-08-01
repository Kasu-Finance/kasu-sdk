import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'

const useUserBonusData = () => {
  const sdk = useSdk()
  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk ? ['userBonus', account.address, sdk] : null,
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
