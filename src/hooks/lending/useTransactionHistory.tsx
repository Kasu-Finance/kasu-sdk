import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useTransactionHistory = (epochId: string) => {
  const sdk = useKasuSDK()

  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk
      ? ['transactionHistory', account.address, sdk]
      : null,
    async ([_, userAdress, sdk]) => {
      const userRequests = await sdk.UserLending.getUserRequests(
        userAdress,
        epochId
      )

      return userRequests.sort((a, b) => b.timestamp - a.timestamp)
    },
    {
      keepPreviousData: true,
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
