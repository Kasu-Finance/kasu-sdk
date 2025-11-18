'use client'

import { Skeleton, SkeletonProps } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useEffect, useState } from 'react'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'

import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'

import dayjs from '@/dayjs'
import { formatAmount, TimeConversions } from '@/utils'

type IncrementalLifetimeInterestEarningsProps = Partial<TokenAmountProps> & {
  currentEpoch: string
  poolOverviews: PoolOverview[]
  skeletonProps?: SkeletonProps
  incrementIntervalMs?: number
}

const IncrementalLifetimeInterestEarnings: React.FC<
  IncrementalLifetimeInterestEarningsProps
> = ({
  currentEpoch,
  poolOverviews,
  skeletonProps,
  incrementIntervalMs = 3000,
  ...rest
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummary(
    currentEpoch,
    poolOverviews
  )
  const [amount, setAmount] = useState(
    portfolioSummary?.lifetime.yieldEarnings || '0'
  )

  useEffect(() => {
    if (!portfolioSummary) return

    const interval = setInterval(() => {
      const startOfWeek = dayjs().startOf('week').unix()
      const now = dayjs().unix()

      const secondsPassed = now - startOfWeek

      const eariningsPerSecond =
        parseFloat(portfolioSummary.weekly.yieldEarnings) /
        TimeConversions.SECONDS_PER_WEEK

      const earningsNow = eariningsPerSecond * secondsPassed

      const newLifetimeAmount =
        parseFloat(portfolioSummary.lifetime.yieldEarnings) + earningsNow

      setAmount(newLifetimeAmount.toString())
    }, incrementIntervalMs)

    return () => {
      clearInterval(interval)
    }
  }, [portfolioSummary, incrementIntervalMs])

  if (isLoading) {
    return (
      <Skeleton variant='rounded' width={90} height={24} {...skeletonProps} />
    )
  }

  return (
    <TokenAmount
      amount={formatAmount(amount, {
        minDecimals: 4,
      })}
      symbol='USDC'
      {...rest}
    />
  )
}

export default IncrementalLifetimeInterestEarnings
