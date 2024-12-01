'use client'

import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const useUserLendingTrancheBalance = <T extends { id: string }>(
  poolId: string,
  tranches: T[]
) => {
  const { account } = useWeb3React()

  const sdk = useKasuSDK()

  const { data, error, isLoading } = useSWR(
    account ? ['userLendingTrancheBalance', account, tranches] : null,
    async ([_, userId]) =>
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
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    userLendingTrancheBalance: data,
    error,
    isLoading,
  }
}

export default useUserLendingTrancheBalance
