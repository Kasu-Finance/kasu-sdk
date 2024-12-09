import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCurrentFtdBalance = (poolId: string) => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account ? ['currentFtdBalance', account, poolId] : null,
    async ([_, userAddress, poolId]) =>
      await sdk.UserLending.getCurrentFtdBalance(poolId, userAddress),
    { fallbackData: new Map() }
  )

  return {
    currentFtdBalance: data,
    error,
    isLoading,
    updateCurrentFtdBalance: mutate,
  }
}

export default useCurrentFtdBalance
