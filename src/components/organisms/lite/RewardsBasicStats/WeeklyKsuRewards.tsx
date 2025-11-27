'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import {
  Skeleton,
  SkeletonProps,
  Typography,
  TypographyProps,
} from '@mui/material'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'

import { formatAmount } from '@/utils'

type WeeklyKsuRewardsProps = TypographyProps & {
  currentEpoch: string
  poolOverviews: PoolOverview[]
  skeletonProps?: SkeletonProps
}

const WeeklyKsuRewards: React.FC<WeeklyKsuRewardsProps> = ({
  currentEpoch,
  poolOverviews,
  skeletonProps,
  ...rest
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummary(
    currentEpoch,
    poolOverviews
  )

  if (isLoading) {
    return (
      <Skeleton variant='rounded' width={90} height={24} {...skeletonProps} />
    )
  }

  return (
    <Typography variant='h3' color='gold.dark' {...rest}>
      {formatAmount(portfolioSummary?.weekly.ksuBonusRewards || '0', {
        minDecimals: 2,
      })}{' '}
      KASU
    </Typography>
  )
}

export default WeeklyKsuRewards
