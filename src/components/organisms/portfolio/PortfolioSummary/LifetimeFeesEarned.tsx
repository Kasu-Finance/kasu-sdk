'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Skeleton } from '@mui/material'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type LifetimeFeesEarnedProps = {
  currentEpoch: string
  poolOverviews: PoolOverview[]
}

const LifetimeFeesEarned: React.FC<LifetimeFeesEarnedProps> = ({
  currentEpoch,
  poolOverviews,
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummary(
    currentEpoch,
    poolOverviews
  )

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
