import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useUserApyBonus = () => {
  const sdk = useKasuSDK()
  const { account } = useWeb3React()

  const { data, error, mutate } = useSWR(
    account ? ['userApyBonus', account] : null,
    async ([_, userAddress]) => sdk.UserLending.getUserApyBonus(userAddress)
  )

  return {
    apyBonus: data,
    error,
    isLoading: !data && !error,
    updateApyBonus: mutate,
  }
}

export default useUserApyBonus
