'use client'

import { Skeleton } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type WeightedAverageApyProps = {
  currentEpoch: string
  poolOverviews: PoolOverview[]
}

const WeightedAverageApy: React.FC<WeightedAverageApyProps> = ({
  currentEpoch,
  poolOverviews,
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummary(
    currentEpoch,
    poolOverviews
  )

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
