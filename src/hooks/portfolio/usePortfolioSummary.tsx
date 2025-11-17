import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const usePortfolioSummary = (
  currentEpoch: string,
  poolOverviews: PoolOverview[]
) => {
  const sdk = useKasuSDK()

  const account = useAccount()

  const {
    portfolioLendingPools,
    isLoading,
    error: portfolioLendingPoolError,
  } = useLendingPortfolioData(poolOverviews, currentEpoch)

  const {
    data,
    isLoading: summaryLoading,
    error,
    mutate,
  } = useSWR(
    account.address && portfolioLendingPools && sdk
      ? ['portfolioSummary', account.address, portfolioLendingPools, sdk]
      : null,
    async ([_, userAddress, portfolioLendingPools, sdk]) =>
      sdk.Portfolio.getPortfolioSummary(
        userAddress.toLowerCase(),
        portfolioLendingPools
      ),
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    portfolioSummary: data,
    error: portfolioLendingPoolError || error,
    isLoading: isLoading || summaryLoading,
    updatePortfolioSummary: mutate,
  }
}

export default usePortfolioSummary
