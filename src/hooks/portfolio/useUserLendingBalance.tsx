'use client'

import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'

import { FIVE_MINUTES } from '@/constants/general'

const useUserLendingBalance = <T extends PortfolioLendingPool | PoolOverview>(
  pools: T[]
) => {
  const account = useAccount()

  const sdk = useSdk()

  const { data, error, isLoading } = useSWR(
    account.address && sdk
      ? ['userLendingTrancheBalance', account.address, pools, sdk]
      : null,
    async ([_, userId, pools, sdk]) =>
      Promise.all(
        pools.map(async (pool) => ({
          ...pool,
          tranches: await Promise.all(
            pool.tranches.map(async (tranche) => ({
              ...tranche,
              balanceData: await sdk.UserLending.getUserTrancheBalance(
                userId.toLowerCase(),
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
