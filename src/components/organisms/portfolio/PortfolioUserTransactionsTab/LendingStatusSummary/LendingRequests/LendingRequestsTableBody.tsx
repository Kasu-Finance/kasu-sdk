'use client'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

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
        tooltipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-1-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.requested, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.requested, { minDecimals: 2 })} USDC`}
      />
      <LendingRequestsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2'
        )}
        tooltipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.accepted, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.accepted, { minDecimals: 2 })} USDC`}
      />
      <LendingRequestsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3'
        )}
        tooltipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.rejected, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.rejected, { minDecimals: 2 })} USDC`}
      />
      <LendingRequestsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-4'
        )}
        tooltipInfo={t(
          'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-4-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.reallocated, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.reallocated, { minDecimals: 2 })} USDC`}
      />
    </>
  )
}
export default LendingRequestsTableBody
