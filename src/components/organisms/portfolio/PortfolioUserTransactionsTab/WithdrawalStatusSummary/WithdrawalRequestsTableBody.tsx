'use client'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import WithdrawalStatusSummaryAcceptedTooltip from '@/components/molecules/tooltips/WithdrawalStatusSummary/WithdrawalStatusSummaryAcceptedTooltip'
import WithdrawalStatusSummaryCancelledTooltip from '@/components/molecules/tooltips/WithdrawalStatusSummary/WithdrawalStatusSummaryCancelledTooltip'
import WithdrawalStatusSummaryQueuedTooltip from '@/components/molecules/tooltips/WithdrawalStatusSummary/WithdrawalStatusSummaryQueuedTooltip'
import WithdrawalStatusSummaryRequestedTooltip from '@/components/molecules/tooltips/WithdrawalStatusSummary/WithdrawalStatusSummaryRequestedTooltip'
import WithdrawalRequestsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary/WithdrawalRequestsTableRow'

import {
  calculateWithdrawalStatusSummary,
  formatAmount,
  getDetailedTransactions,
} from '@/utils'

type WithdrawalRequestsTableBodyProps = {
  currentEpoch: string
}

const WithdrawalRequestsTableBody: React.FC<
  WithdrawalRequestsTableBodyProps
> = ({ currentEpoch }) => {
  const { t } = getTranslation()

  const { transactionHistory } = useTransactionHistory(currentEpoch)

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
        tooltipInfo={<WithdrawalStatusSummaryRequestedTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.requested, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.requested, { minDecimals: 2 })} USDC`}
        variant='secondary'
      />
      <WithdrawalRequestsTableRow
        title={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2'
        )}
        tooltipInfo={<WithdrawalStatusSummaryQueuedTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.queued, { minDecimals: 2 })} USDC`}
        totalLifetimeValue='N/A'
      />
      <WithdrawalRequestsTableRow
        title={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3'
        )}
        tooltipInfo={<WithdrawalStatusSummaryAcceptedTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.accepted, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.accepted, { minDecimals: 2 })} USDC`}
      />
      <WithdrawalRequestsTableRow
        title={t(
          'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-4'
        )}
        tooltipInfo={<WithdrawalStatusSummaryCancelledTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.cancelled, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.cancelled, { minDecimals: 2 })} USDC`}
      />
    </>
  )
}

export default WithdrawalRequestsTableBody
