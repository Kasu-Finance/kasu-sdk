import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useCurrentFtdBalance = (poolId: string) => {
  const sdk = useSdk()
  const chainId = useChainId()

  const { address } = usePrivyAuthenticated()

  const { data, error, isLoading, mutate } = useSWR(
    address && sdk && chainId
      ? [
          'currentFtdBalance',
          chainId,
          address.toLowerCase(),
          poolId.toLowerCase(),
        ]
      : null,
    async () => {
      if (!sdk) throw new Error('SDK not ready')
      if (!address) throw new Error('Wallet not connected')
      return await sdk.UserLending.getCurrentFtdBalance(
        poolId,
        address.toLowerCase() as `0x${string}`
      )
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    currentFtdBalance: data,
    error,
    isLoading,
    updateCurrentFtdBalance: mutate,
  }
}

export default useCurrentFtdBalance
