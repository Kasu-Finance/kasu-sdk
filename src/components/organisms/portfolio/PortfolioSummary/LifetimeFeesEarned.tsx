'use client'

import { Skeleton, SkeletonProps } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type LifetimeFeesEarnedProps = Partial<TokenAmountProps> & {
  currentEpoch: string
  poolOverviews: PoolOverview[]
  skeletonProps?: SkeletonProps
}

const LifetimeFeesEarned: React.FC<LifetimeFeesEarnedProps> = ({
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
    <TokenAmount
      amount={formatAmount(
        portfolioSummary?.lifetime.protocolFeesEarned || '0',
        {
          minDecimals: 2,
        }
      )}
      symbol='USDC'
      {...rest}
    />
  )
}

export default LifetimeFeesEarned
