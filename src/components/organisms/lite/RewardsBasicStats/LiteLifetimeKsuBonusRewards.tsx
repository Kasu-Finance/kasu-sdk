'use client'

import { Skeleton, SkeletonProps } from '@mui/material'

import usePortfolioSummaryContext from '@/hooks/context/usePortfolioSummaryContext'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type LiteLifetimeKsuBonusRewardsProps = Partial<TokenAmountProps> & {
  skeletonProps?: SkeletonProps
}

const LiteLifetimeKsuBonusRewards: React.FC<
  LiteLifetimeKsuBonusRewardsProps
> = ({ skeletonProps, ...rest }) => {
  const { portfolioSummary, isLoading } = usePortfolioSummaryContext()

  if (isLoading) {
    return (
      <Skeleton variant='rounded' width={90} height={24} {...skeletonProps} />
    )
  }

  return (
    <TokenAmount
      amount={formatAmount(portfolioSummary?.lifetime.ksuBonusRewards || '0', {
        minDecimals: 2,
      })}
      symbol='KASU'
      {...rest}
    />
  )
}

export default LiteLifetimeKsuBonusRewards
