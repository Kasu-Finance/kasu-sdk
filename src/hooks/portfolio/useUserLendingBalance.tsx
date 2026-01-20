'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { FIVE_MINUTES } from '@/constants/general'

const useUserLendingBalance = <T extends PortfolioLendingPool | PoolOverview>(
  pools: T[]
) => {
  const { address } = usePrivyAuthenticated()

  const sdk = useSdk()

  const { data, error, isLoading } = useSWR(
    address && sdk ? ['userLendingTrancheBalance', address, pools] : null,
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
