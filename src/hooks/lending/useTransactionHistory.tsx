import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useTransactionHistory = (epochId: string) => {
  const sdk = useSdk()

  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk ? ['transactionHistory', address, sdk] : null,
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
