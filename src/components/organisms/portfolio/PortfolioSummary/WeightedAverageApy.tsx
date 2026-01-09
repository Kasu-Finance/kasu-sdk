'use client'

import { Skeleton } from '@mui/material'

import usePortfolioSummaryContext from '@/hooks/context/usePortfolioSummaryContext'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

const WeightedAverageApy: React.FC = () => {
  const { portfolioSummary, isLoading } = usePortfolioSummaryContext()

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
