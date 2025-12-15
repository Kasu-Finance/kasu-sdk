'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { FIVE_MINUTES } from '@/constants/general'

const useUserLendingTrancheBalance = <T extends { id: string }>(
  poolId: string,
  tranches: T[]
) => {
  const { address } = usePrivyAuthenticated()

  const sdk = useSdk()

  const chainId = useChainId()

  const addressLower = address?.toLowerCase()

  const trancheIdsKey = useMemo(() => {
    return tranches
      .map((tranche) => tranche.id.toLowerCase())
      .sort()
      .join(',')
  }, [tranches])

  const { data, error, isLoading } = useSWR(
    addressLower && sdk && chainId
      ? [
          'userLendingTrancheBalance',
          chainId,
          addressLower,
          poolId.toLowerCase(),
          trancheIdsKey,
        ]
      : null,
    async () => {
      if (!sdk) throw new Error('SDK not ready')
      if (!addressLower) throw new Error('Wallet not connected')

      return await Promise.all(
        tranches.map(async (tranche) => ({
          ...tranche,
          balanceData: await sdk.UserLending.getUserTrancheBalance(
            addressLower,
            poolId,
            tranche.id
          ),
        }))
      )
    },
    {
      dedupingInterval: FIVE_MINUTES,
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    userLendingTrancheBalance: data,
    error,
    isLoading,
  }
}

export default useUserLendingTrancheBalance
