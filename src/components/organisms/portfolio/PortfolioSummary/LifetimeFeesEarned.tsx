'use client'

import { Skeleton } from '@mui/material'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

const LifetimeFeesEarned = () => {
  const { portfolioSummary, isLoading } = usePortfolioSummary()

  if (isLoading) {
    return <Skeleton variant='rounded' width={90} height={24} />
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
    />
  )
}

export default LifetimeFeesEarned
