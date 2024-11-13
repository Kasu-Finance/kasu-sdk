'use client'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import LendingStatusSummaryAcceptedTooltip from '@/components/molecules/tooltips/LendingStatusSummary/LendingStatusSummaryAcceptedTooltip'
import LendingStatusSummaryReallocationTooltip from '@/components/molecules/tooltips/LendingStatusSummary/LendingStatusSummaryReallocations'
import LendingStatusSummaryRejectedTooltip from '@/components/molecules/tooltips/LendingStatusSummary/LendingStatusSummaryRejectedTooltip'
import LendingStatusSummaryRequestedTooltip from '@/components/molecules/tooltips/LendingStatusSummary/LendingStatusSummaryRequestedTooltip'
import LendingRequestsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingRequests/LendingRequestsTableRow'

import {
  calculateLendingSattusSummary,
  formatAmount,
  getDetailedTransactions,
} from '@/utils'

const LendingRequestsTableBody = () => {
  const { t } = getTranslation()

  const { transactionHistory } = useTransactionHistory()

  const detailedTransactions = getDetailedTransactions(
    transactionHistory ?? [],
    []
  )

  const { nextEpochTime } = useNextEpochTime()

  const { currentEpochAmounts, lifetimeAmounts } =
    calculateLendingSattusSummary(detailedTransactions, nextEpochTime)

  return (
    <>
      <LendingRequestsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-1'
        )}
        tooltipInfo={<LendingStatusSummaryRequestedTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.requested, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.requested, { minDecimals: 2 })} USDC`}
      />
      <LendingRequestsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2'
        )}
        tooltipInfo={<LendingStatusSummaryAcceptedTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.accepted, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.accepted, { minDecimals: 2 })} USDC`}
      />
      <LendingRequestsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3'
        )}
        tooltipInfo={<LendingStatusSummaryRejectedTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.rejected, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.rejected, { minDecimals: 2 })} USDC`}
      />
      <LendingRequestsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-4'
        )}
        tooltipInfo={<LendingStatusSummaryReallocationTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.reallocated, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.reallocated, { minDecimals: 2 })} USDC`}
      />
    </>
  )
}
export default LendingRequestsTableBody
