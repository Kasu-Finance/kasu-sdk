'use client'

import { Card, CardContent, Skeleton, Stack } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import PortfolioUserTransactionSkeleton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedLendingRequestTransactions/PortfolioUserTransactionSkeleton'
import WithdrawalTransactionsSkeleton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/WithdrawalTransactionsSkeleton'
import LendingStatusSummarySkeleton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingStatusSummarySkeleton'
import WithdrawalStatusSummarySkeleton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary/WithdrawalStatusSummarySkeleton'

const Loading = () => {
  const { isLiteMode } = useLiteModeState()

  if (typeof isLiteMode === 'undefined' || isLiteMode) {
    return null
  }

  return (
    <Stack spacing={3}>
      <Skeleton variant='rounded' height={40} />

      <Skeleton variant='rounded' height={80} />

      <Card>
        <Skeleton variant='rectangular' height={72} />
        <CardContent>
          <LendingStatusSummarySkeleton />
        </CardContent>
      </Card>

      <Card>
        <Skeleton variant='rectangular' height={72} />
        <CardContent>
          <WithdrawalStatusSummarySkeleton />
        </CardContent>
      </Card>

      <Card>
        <Skeleton variant='rectangular' height={72} />
        <CardContent>
          <PortfolioUserTransactionSkeleton />
        </CardContent>
      </Card>

      <Card>
        <Skeleton variant='rectangular' height={72} />
        <CardContent>
          <WithdrawalTransactionsSkeleton />
        </CardContent>
      </Card>
    </Stack>
  )
}

export default Loading
