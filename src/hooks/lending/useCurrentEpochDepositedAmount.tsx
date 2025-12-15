import { useMemo } from 'react'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useCurrentEpochDepositedAmount = (lendingPoolIds: string | string[]) => {
  const sdk = useSdk()
  const chainId = useChainId()

  const { address } = usePrivyAuthenticated()

  const addressLower = address?.toLowerCase()

  const normalizedPoolIds = useMemo(() => {
    const ids = Array.isArray(lendingPoolIds)
      ? lendingPoolIds
      : [lendingPoolIds]
    return ids.map((id) => id.toLowerCase()).sort()
  }, [lendingPoolIds])

  const poolIdsKey = useMemo(
    () => normalizedPoolIds.join(','),
    [normalizedPoolIds]
  )

  const { data, error, isLoading, mutate } = useSWR(
    addressLower && sdk && chainId
      ? ['currentEpochDepositedAmount', chainId, addressLower, poolIdsKey]
      : null,
    async () => {
      if (!sdk) throw new Error('SDK not ready')

      return await sdk.UserLending.getCurrentEpochDepositedAmount(
        normalizedPoolIds,
        addressLower as `0x${string}`
      )
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    currentEpochDepositedAmount: data,
    error,
    isLoading,
    updateCurrentEpochDepositedAmount: mutate,
  }
}

export default useCurrentEpochDepositedAmount
