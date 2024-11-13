'use client'

import useLoanTickets from '@/hooks/lending/useLoanTickets'
import getTranslation from '@/hooks/useTranslation'

import SubsequentTransactionsOptedInTooltip from '@/components/molecules/tooltips/SubsequentTransactions/SubsequentTransactionsOptedInTooltip'
import SubsequentTransactionsOptedOutTooltip from '@/components/molecules/tooltips/SubsequentTransactions/SubsequentTransactionsOptedOutTooltip'
import SubsequentTransactionsPendingTooltip from '@/components/molecules/tooltips/SubsequentTransactions/SubsequentTransactionsPendingTooltip'
import SubsequentTransactionsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/SubsequentTransactions/SubsequentTransactionsTableRow'

import { calculateSubsequentTransactionSummary, formatAmount } from '@/utils'

type SubsequentTransactionsTableBodyProps = {
  currentEpoch: string
}

const SubsequentTransactionsTableBody: React.FC<
  SubsequentTransactionsTableBodyProps
> = ({ currentEpoch }) => {
  const { t } = getTranslation()

  const { loanTickets } = useLoanTickets()

  const { currentEpochAmounts, lifetimeAmounts } =
    calculateSubsequentTransactionSummary(loanTickets || [], currentEpoch)

  return (
    <>
      <SubsequentTransactionsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-2'
        )}
        tooltipInfo={<SubsequentTransactionsPendingTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.pendingDecisionAmount, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.pendingDecisionAmount, { minDecimals: 2 })} USDC`}
      />
      <SubsequentTransactionsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-3'
        )}
        tooltipInfo={<SubsequentTransactionsOptedInTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.optedInAmount, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.optedInAmount, { minDecimals: 2 })} USDC`}
      />
      <SubsequentTransactionsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-4'
        )}
        tooltipInfo={<SubsequentTransactionsOptedOutTooltip />}
        currentEpochValue={`${formatAmount(currentEpochAmounts.optedOutAmount, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.optedOutAmount, { minDecimals: 2 })} USDC`}
      />
    </>
  )
}
export default SubsequentTransactionsTableBody
