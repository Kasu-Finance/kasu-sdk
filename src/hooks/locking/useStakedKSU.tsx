import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useStakedKSU = () => {
  const { account } = useWeb3React()

  const sdk = useKasuSDK()

  const { data, error } = useSWR(
    account ? ['stakedKasu', account] : null,
    async ([_, userAddress]) => sdk.Locking.getUserStakedKsu(userAddress)
  )

  return {
    stakedKSU: data,
    error,
    isLoading: !data && !error,
  }
}

export default useStakedKSU
