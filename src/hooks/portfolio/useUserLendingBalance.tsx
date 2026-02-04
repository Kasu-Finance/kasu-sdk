'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { FIVE_MINUTES } from '@/constants/general'

const useUserLendingBalance = <T extends PortfolioLendingPool | PoolOverview>(
  pools: T[]
) => {
  const { address } = usePrivyAuthenticated()
  const { currentChainId } = useChain()

  const sdk = useSdk()

  // Create a stable cache key from pool IDs instead of full objects
  const poolIdsKey = useMemo(
    () =>
      pools
        .map((p) => p.id)
        .sort()
        .join(','),
    [pools]
  )

  const { data, error, isLoading } = useSWR(
    address && sdk && pools.length > 0
      ? ['userLendingTrancheBalance', currentChainId, address, poolIdsKey]
      : null,
    async () =>
      Promise.all(
        pools.map(async (pool) => ({
          ...pool,
          tranches: await Promise.all(
            pool.tranches.map(async (tranche) => ({
              ...tranche,
              balanceData: await sdk!.UserLending.getUserTrancheBalance(
                address!.toLowerCase(),
                pool.id,
                tranche.id
              ),
            }))
          ),
        }))
      ),

    { dedupingInterval: FIVE_MINUTES, keepPreviousData: true }
  )

  return {
    userLendingBalance: data,
    error,
    isLoading,
  }
}

export default useUserLendingBalance
