import { PoolOverview } from '@kasufinance/kasu-sdk'
import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { FIVE_MINUTES } from '@/constants/general'

const usePortfolioSummary = (
  currentEpoch: string,
  poolOverviews: PoolOverview[]
) => {
  const sdk = useSdk()

  const { currentChainId: chainId } = useChain()

  const { address, isAuthenticated } = usePrivyAuthenticated()
  const addressLower = address?.toLowerCase()

  const poolOverviewsKey = useMemo(() => {
    return poolOverviews
      .map(
        (pool) =>
          `${pool.id.toLowerCase()}:${pool.tranches
            .map((tranche) => tranche.id.toLowerCase())
            .sort()
            .join(',')}`
      )
      .sort()
      .join('|')
  }, [poolOverviews])

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
    addressLower && portfolioLendingPools && sdk && chainId
      ? [
          'portfolioSummary',
          chainId,
          addressLower,
          currentEpoch,
          poolOverviewsKey,
        ]
      : null,
    async ([_, __chainId, userAddress, epoch]) => {
      if (!sdk) throw new Error('SDK not ready')
      if (!portfolioLendingPools) {
        throw new Error('Portfolio lending pools not ready')
      }
      return await sdk.Portfolio.getPortfolioSummary(
        userAddress,
        portfolioLendingPools,
        epoch
      )
    },
    {
      dedupingInterval: FIVE_MINUTES,
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    portfolioSummary: data,
    error: portfolioLendingPoolError || error,
    isLoading: isAuthenticated && (isLoading || summaryLoading),
    updatePortfolioSummary: mutate,
  }
}

export default usePortfolioSummary
