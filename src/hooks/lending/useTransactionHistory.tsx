import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useTransactionHistory = (epochId: string) => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account ? ['transactionHistory', account] : null,
    async ([_, userAdress]) => {
      const userRequests = await sdk.UserLending.getUserRequests(
        userAdress as `0x${string}`,
        epochId
      )

      return userRequests.sort((a, b) => b.timestamp - a.timestamp)
    }
  )

  return {
    transactionHistory: data,
    error,
    isLoading,
    updateTransactionHistory: mutate,
  }
}

export default useTransactionHistory
