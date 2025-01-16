import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const usePortfolioSummary = (
  currentEpoch: string,
  poolOverviews: PoolOverview[]
) => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

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
    account && portfolioLendingPools && sdk
      ? ['portfolioSummary', account, portfolioLendingPools, sdk]
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
