'use client'

import { Skeleton, SkeletonProps } from '@mui/material'

import usePortfolioSummaryContext from '@/hooks/context/usePortfolioSummaryContext'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type LifetimeInterestEarningsProps = Partial<TokenAmountProps> & {
  skeletonProps?: SkeletonProps
}

const LifetimeInterestEarnings: React.FC<LifetimeInterestEarningsProps> = ({
  skeletonProps,
  ...rest
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummaryContext()

  if (isLoading) {
    return (
      <Skeleton variant='rounded' width={90} height={24} {...skeletonProps} />
    )
  }

  return (
    <TokenAmount
      amount={formatAmount(portfolioSummary?.lifetime.yieldEarnings || '0', {
        minDecimals: 2,
      })}
      symbol='USDC'
      {...rest}
    />
  )
}

export default LifetimeInterestEarnings
