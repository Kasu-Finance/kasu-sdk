'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { Skeleton, SkeletonProps } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import usePortfolioSummaryContext from '@/hooks/context/usePortfolioSummaryContext'
import useLatestClearingTimestamp from '@/hooks/lending/useLatestClearingTimestamp'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import dayjs from '@/dayjs'
import { formatAmount, TimeConversions } from '@/utils'

type IncrementalLifetimeInterestEarningsProps = Partial<TokenAmountProps> & {
  currentEpoch: string
  poolOverviews: PoolOverview[]
  portfolioLendingPools?: PortfolioLendingPool[]
  skeletonProps?: SkeletonProps
  incrementIntervalMs?: number
}

const IncrementalLifetimeInterestEarnings: React.FC<
  IncrementalLifetimeInterestEarningsProps
> = ({
  currentEpoch: _currentEpoch,
  skeletonProps,
  incrementIntervalMs = 3000,
  poolOverviews,
  portfolioLendingPools,
  ...rest
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummaryContext()
  const [amount, setAmount] = useState(
    portfolioSummary?.lifetime.yieldEarnings || '0'
  )

  const poolIds = useMemo(() => {
    const sourcePools =
      portfolioLendingPools && portfolioLendingPools.length
        ? portfolioLendingPools
        : poolOverviews

    return Array.from(
      new Set(sourcePools.map((pool) => pool.id.toLowerCase()).filter(Boolean))
    )
  }, [poolOverviews, portfolioLendingPools])

  const { latestClearingTimestamp } = useLatestClearingTimestamp(poolIds)

  useEffect(() => {
    if (!portfolioSummary) return
    setAmount(portfolioSummary.lifetime.yieldEarnings)
  }, [portfolioSummary])

  useEffect(() => {
    if (!portfolioSummary || !latestClearingTimestamp) return

    const updateAmount = () => {
      const now = dayjs().unix()
      const secondsPassed = Math.max(0, now - latestClearingTimestamp)
      const cappedSeconds = Math.min(
        TimeConversions.SECONDS_PER_WEEK,
        secondsPassed
      )

      const earningsPerSecond =
        parseFloat(portfolioSummary.weekly.yieldEarnings) /
        TimeConversions.SECONDS_PER_WEEK

      const earningsNow = earningsPerSecond * cappedSeconds

      const newLifetimeAmount =
        parseFloat(portfolioSummary.lifetime.yieldEarnings) + earningsNow

      setAmount(newLifetimeAmount.toString())
    }

    updateAmount()

    const interval = setInterval(updateAmount, incrementIntervalMs)

    return () => {
      clearInterval(interval)
    }
  }, [portfolioSummary, latestClearingTimestamp, incrementIntervalMs])

  if (isLoading) {
    return (
      <Skeleton variant='rounded' width={90} height={24} {...skeletonProps} />
    )
  }

  return (
    <TokenAmount
      amount={formatAmount(amount, {
        minDecimals: 4,
        maxDecimals: 4,
      })}
      symbol='USDC'
      {...rest}
    />
  )
}

export default IncrementalLifetimeInterestEarnings
