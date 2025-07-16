'use client'

import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const useUserLendingTrancheBalance = <T extends { id: string }>(
  poolId: string,
  tranches: T[]
) => {
  const account = useAccount()

  const sdk = useKasuSDK()

  const { data, error, isLoading } = useSWR(
    account.address && sdk
      ? ['userLendingTrancheBalance', account.address, tranches, sdk]
      : null,
    async ([_, userId, tranches, sdk]) =>
      Promise.all(
        tranches.map(async (tranche) => ({
          ...tranche,
          balanceData: await sdk.UserLending.getUserTrancheBalance(
            userId.toLowerCase(),
            poolId,
            tranche.id
          ),
        }))
      ),
    { dedupingInterval: FIVE_MINUTES, keepPreviousData: true }
  )

  return {
    userLendingTrancheBalance: data,
    error,
    isLoading,
  }
}

export default useUserLendingTrancheBalance
