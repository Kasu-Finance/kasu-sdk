import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useEarnedRKsu = () => {
  const { account } = useWeb3React()

  const sdk = useKasuSDK()

  const { data, error } = useSWR(
    account ? ['stakedKasu', account] : null,
    async ([_, userAddress]) => sdk.Locking.getUserEarnedrKsu(userAddress)
  )

  return {
    rKsuAmount: data,
    error,
    isLoading: !data && !error,
  }
}

export default useEarnedRKsu
