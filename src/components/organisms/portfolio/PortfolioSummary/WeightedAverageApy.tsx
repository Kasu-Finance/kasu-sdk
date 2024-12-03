'use client'

import { Skeleton } from '@mui/material'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

const WeightedAverageApy = () => {
  const { portfolioSummary, isLoading } = usePortfolioSummary()

  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <TokenAmount
      amount={formatAmount(
        parseFloat(portfolioSummary?.current.weightedAverageApy || '0') * 100,
        { minDecimals: 2 }
      )}
      symbol='%'
    />
  )
}

export default WeightedAverageApy
