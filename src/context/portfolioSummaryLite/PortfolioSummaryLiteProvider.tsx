'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import portfolioSummaryLiteContext from '@/context/portfolioSummaryLite/portfolioSummaryLite.context'

import { FIVE_MINUTES } from '@/constants/general'

type PortfolioSummaryLiteProviderProps = {
  children: React.ReactNode
  currentEpoch: string
  poolOverviews: PoolOverview[]
  portfolioLendingPools?: PortfolioLendingPool[]
}

const PortfolioSummaryLiteProvider: React.FC<
  PortfolioSummaryLiteProviderProps
> = ({ children, currentEpoch, poolOverviews, portfolioLendingPools }) => {
  const sdk = useSdk()
  const chainId = useChainId()

  const { address } = usePrivyAuthenticated()
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

  const shouldEnable = Boolean(addressLower && chainId && sdk)
  const canFetch = shouldEnable && Boolean(portfolioLendingPools)

  const key = canFetch
    ? ([
        'portfolioSummaryLite',
        chainId,
        addressLower!,
        currentEpoch,
        poolOverviewsKey,
      ] as const)
    : null

  const {
    data: portfolioSummary,
    error,
    isLoading: swrIsLoading,
    mutate,
  } = useSWR(
    key,
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

  const isLoading = shouldEnable && !portfolioLendingPools ? true : swrIsLoading

  return (
    <portfolioSummaryLiteContext.Provider
      value={{
        portfolioSummary,
        isLoading,
        error,
        updatePortfolioSummary: mutate,
      }}
    >
      {children}
    </portfolioSummaryLiteContext.Provider>
  )
}

export default PortfolioSummaryLiteProvider
