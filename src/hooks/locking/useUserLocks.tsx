import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useUserLocks = () => {
  const sdk = useKasuSDK()
  const { account } = useWeb3React()

  const { data, error, mutate } = useSWR(
    account ? ['userLocks', account] : null,
    async ([_, userAddress]) => sdk.Locking.getUserLocks(userAddress)
  )

  return {
    userLocks: data,
    error,
    isLoading: !data && !error,
    updateUserLocks: mutate,
  }
}

export default useUserLocks
