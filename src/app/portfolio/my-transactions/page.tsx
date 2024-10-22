import { Stack } from '@mui/material'

import DetailedTransactions from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions'
import LendingStatusSummary from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary'
import NotificationBanner from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/NotificationBanner'
import WithdrawalStatusSummary from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary'

const YourTransactions = () => {
  return (
    <Stack spacing={3}>
      <NotificationBanner />
      <LendingStatusSummary />
      <WithdrawalStatusSummary />
      <DetailedTransactions />
    </Stack>
  )
}

export default YourTransactions
