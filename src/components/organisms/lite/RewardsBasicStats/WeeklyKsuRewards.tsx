'use client'

import {
  Skeleton,
  SkeletonProps,
  Typography,
  TypographyProps,
} from '@mui/material'

import usePortfolioSummaryLite from '@/hooks/context/usePortfolioSummaryLite'

import { formatAmount } from '@/utils'

type WeeklyKsuRewardsProps = TypographyProps & {
  skeletonProps?: SkeletonProps
}

const WeeklyKsuRewards: React.FC<WeeklyKsuRewardsProps> = ({
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
      {formatAmount(portfolioSummary?.weekly.ksuBonusRewards || '0', {
        minDecimals: 2,
      })}{' '}
      KASU
    </Typography>
  )
}

export default WeeklyKsuRewards
