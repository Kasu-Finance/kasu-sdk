'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import {
  Skeleton,
  SkeletonProps,
  Typography,
  TypographyProps,
} from '@mui/material'

import usePortfolioSummaryLite from '@/hooks/context/usePortfolioSummaryLite'

import { formatAmount } from '@/utils'

type WeeklyInterestEarningsProps = TypographyProps & {
  currentEpoch: string
  poolOverviews: PoolOverview[]
  skeletonProps?: SkeletonProps
}

const WeeklyInterestEarnings: React.FC<WeeklyInterestEarningsProps> = ({
  skeletonProps,
  ...rest
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummaryLite()

  if (isLoading) {
    return (
      <Skeleton variant='rounded' width={90} height={24} {...skeletonProps} />
    )
  }

  return (
    <Typography variant='h3' color='gold.dark' {...rest}>
      {formatAmount(portfolioSummary?.weekly.yieldEarnings || '0', {
        minDecimals: 2,
      })}{' '}
      USDC
    </Typography>
  )
}

export default WeeklyInterestEarnings
