'use client'

import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

import { PoolOverviewWithDelegate } from '@/types/page'

const useUserLendingTrancheBalance = (pool: PoolOverviewWithDelegate) => {
  const { account } = useWeb3React()

  const sdk = useKasuSDK()

  const { data, error, isLoading } = useSWR(
    account ? ['userLendingTrancheBalanceTest', account, pool] : null,
    async ([_, userId]) =>
      Promise.all(
        pool.tranches.map(async (tranche) => ({
          ...tranche,
          balanceData: await sdk.UserLending.getUserTrancheBalance(
            userId.toLowerCase(),
            tranche.id
          ),
        }))
      ),
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    userLendingTrancheBalance: data,
    error,
    isLoading,
  }
}

export default useUserLendingTrancheBalance
