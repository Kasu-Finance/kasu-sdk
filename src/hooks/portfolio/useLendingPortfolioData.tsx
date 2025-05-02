import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useKasuSDK from '@/hooks/useKasuSDK'

const useLendingPortfolioData = (
  poolOverviews: PoolOverview[],
  currentEpoch: string
) => {
  const sdk = useKasuSDK()

  const account = useAccount()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && sdk
      ? ['lendingPortfolioData', account.address, poolOverviews, sdk]
      : null,
    async ([_, userAddress, poolOverviews, sdk]) =>
      await sdk.Portfolio.getPortfolioLendingData(
        userAddress.toLowerCase(),
        poolOverviews,
        currentEpoch
      )
  )

  return {
    portfolioLendingPools: data,
    error,
    isLoading,
    updateLendingPortfolioData: mutate,
  }
}

export default useLendingPortfolioData
