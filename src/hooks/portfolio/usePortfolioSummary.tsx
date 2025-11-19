import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { FIVE_MINUTES } from '@/constants/general'

const usePortfolioSummary = (
  currentEpoch: string,
  poolOverviews: PoolOverview[]
) => {
  const sdk = useSdk()

  const { address, isAuthenticated } = usePrivyAuthenticated()

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
    address && portfolioLendingPools && sdk
      ? ['portfolioSummary', address, portfolioLendingPools, sdk]
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
    isLoading: isAuthenticated && (isLoading || summaryLoading),
    updatePortfolioSummary: mutate,
  }
}

export default usePortfolioSummary
