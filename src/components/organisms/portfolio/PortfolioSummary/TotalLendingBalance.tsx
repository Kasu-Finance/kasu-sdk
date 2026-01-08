'use client'

import { Skeleton, SkeletonProps } from '@mui/material'

import usePortfolioSummaryContext from '@/hooks/context/usePortfolioSummaryContext'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type TotalLendingBalanceProps = Partial<TokenAmountProps> & {
  skeletonProps?: SkeletonProps
}

const TotalLendingBalance: React.FC<TotalLendingBalanceProps> = ({
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
      amount={formatAmount(
        portfolioSummary?.current.totalLendingPoolInvestments || '0',
        {
          minDecimals: 2,
        }
      )}
      symbol='USDC'
      {...rest}
    />
  )
}

export default TotalLendingBalance
