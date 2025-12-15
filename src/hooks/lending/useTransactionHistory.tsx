import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useTransactionHistory = (epochId: string) => {
  const sdk = useSdk()

  const chainId = useChainId()

  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk && chainId && epochId
      ? ['transactionHistory', chainId, address.toLowerCase(), epochId]
      : null,
    async ([_, __chainId, userAddress, epochId]) => {
      if (!sdk) throw new Error('SDK not ready')

      const userRequests = await sdk.UserLending.getUserRequests(
        userAddress as `0x${string}`,
        epochId
      )

      return userRequests.sort((a, b) => b.timestamp - a.timestamp)
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
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
