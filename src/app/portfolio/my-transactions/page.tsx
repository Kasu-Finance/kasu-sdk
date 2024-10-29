import { Stack } from '@mui/material'

import DetailedTransactions from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions'
import LendingStatusSummary from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary'
import NotificationBannerWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/NotificationBanner/NotificationBannerWrapper'
import WithdrawalStatusSummary from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary'

const YourTransactions = async () => {
  return (
    <Stack spacing={3}>
      <NotificationBannerWrapper />
      <LendingStatusSummary />
      <WithdrawalStatusSummary />
      <DetailedTransactions />
    </Stack>
  )
}

export default YourTransactions
