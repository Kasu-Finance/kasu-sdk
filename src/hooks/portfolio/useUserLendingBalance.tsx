'use client'

import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const useUserLendingBalance = (pools: PortfolioLendingPool[]) => {
  const account = useAccount()

  const sdk = useKasuSDK()

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
