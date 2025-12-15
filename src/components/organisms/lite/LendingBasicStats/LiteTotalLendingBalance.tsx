'use client'

import { Skeleton, SkeletonProps } from '@mui/material'

import usePortfolioSummaryLite from '@/hooks/context/usePortfolioSummaryLite'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type LiteTotalLendingBalanceProps = Partial<TokenAmountProps> & {
  skeletonProps?: SkeletonProps
}

const LiteTotalLendingBalance: React.FC<LiteTotalLendingBalanceProps> = ({
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

export default LiteTotalLendingBalance
