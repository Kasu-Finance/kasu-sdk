import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useUserApyBonus = () => {
  const sdk = useKasuSDK()
  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk ? ['userApyBonus', account.address, sdk] : null,
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
