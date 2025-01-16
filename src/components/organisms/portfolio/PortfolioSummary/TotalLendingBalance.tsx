'use client'

import { Skeleton } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

type TotalLendingBalanceProps = {
  currentEpoch: string
  poolOverviews: PoolOverview[]
}

const TotalLendingBalance: React.FC<TotalLendingBalanceProps> = ({
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
        portfolioSummary?.current.totalLendingPoolInvestments || '0',
        {
          minDecimals: 2,
        }
      )}
      symbol='USDC'
    />
  )
}

export default TotalLendingBalance
