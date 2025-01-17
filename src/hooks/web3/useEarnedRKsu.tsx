import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useEarnedRKsu = () => {
  const { account } = useWeb3React()

  const sdk = useKasuSDK()

  const { data, error, isLoading, mutate } = useSWR(
    account && sdk ? ['earnedRKsu', account, sdk] : null,
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
