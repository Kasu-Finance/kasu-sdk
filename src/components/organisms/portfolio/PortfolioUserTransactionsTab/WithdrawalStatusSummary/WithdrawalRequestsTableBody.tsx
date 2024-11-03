'use client'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import WithdrawalRequestsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary/WithdrawalRequestsTableRow'

import {
  calculateWithdrawalStatusSummary,
  formatAmount,
  getDetailedTransactions,
} from '@/utils'

const WithdrawalRequestsTableBody = () => {
  const { t } = useTranslation()

  const { transactionHistory } = useTransactionHistory()

  const detailedTransactions = getDetailedTransactions(
    transactionHistory ?? [],
    []
  )

  const { nextEpochTime } = useNextEpochTime()

  const { currentEpochAmounts, lifetimeAmounts } =
    calculateWithdrawalStatusSummary(detailedTransactions, nextEpochTime)

  return (
    <>
      <WithdrawalRequestsTableRow
        title={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-1'
        )}
        tooltipInfo={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-1-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.requested, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.requested, { minDecimals: 2 })} USDC`}
      />
      <WithdrawalRequestsTableRow
        title={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2'
        )}
        tooltipInfo={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.queued, { minDecimals: 2 })} USDC`}
        totalLifetimeValue='N/A'
      />
      <WithdrawalRequestsTableRow
        title={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3'
        )}
        tooltipInfo={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.accepted, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.accepted, { minDecimals: 2 })} USDC`}
      />
    </>
  )
}

export default WithdrawalRequestsTableBody
