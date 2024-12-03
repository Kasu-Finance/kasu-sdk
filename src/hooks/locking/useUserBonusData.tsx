import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useUserBonusData = () => {
  const sdk = useKasuSDK()
  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account ? ['userBonus', account] : null,
    async ([_, userAddress]) => sdk.Locking.getUserBonusData(userAddress)
  )

  return {
    userBonus: data,
    error,
    isLoading,
    updateUserBonus: mutate,
  }
}

export default useUserBonusData
