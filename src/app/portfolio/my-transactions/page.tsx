import { Stack } from '@mui/material'
import { Suspense } from 'react'

import DetailedTransactions from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions'
import LendingStatusSummary from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary'
import NotificationBannerWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/NotificationBanner/NotificationBannerWrapper'
import WithdrawalStatusSummary from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'

const YourTransactions = async () => {
  const currentEpoch = await getCurrentEpoch()

  return (
    <Stack spacing={3}>
      <NotificationBannerWrapper />
      <Suspense fallback={null}>
        <LendingStatusSummary />
        <WithdrawalStatusSummary currentEpoch={currentEpoch} />
      </Suspense>
      <DetailedTransactions currentEpoch={currentEpoch} />
    </Stack>
  )
}

export default YourTransactions
