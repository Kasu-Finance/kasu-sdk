'use client'

import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { FIVE_MINUTES } from '@/constants/general'

const useUserLendingTrancheBalance = <T extends { id: string }>(
  poolId: string,
  tranches: T[]
) => {
  const { address } = usePrivyAuthenticated()

  const sdk = useSdk()

  const { data, error, isLoading } = useSWR(
    address && sdk
      ? ['userLendingTrancheBalance', address, tranches, sdk]
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
