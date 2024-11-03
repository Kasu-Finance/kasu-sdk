'use client'

import useLoanTickets from '@/hooks/lending/useLoanTickets'
import useTranslation from '@/hooks/useTranslation'

import SubsequentTransactionsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/SubsequentTransactions/SubsequentTransactionsTableRow'

import { calculateSubsequentTransactionSummary, formatAmount } from '@/utils'

type SubsequentTransactionsTableBodyProps = {
  currentEpoch: string
}

const SubsequentTransactionsTableBody: React.FC<
  SubsequentTransactionsTableBodyProps
> = ({ currentEpoch }) => {
  const { t } = useTranslation()

  const { loanTickets } = useLoanTickets()

  const { currentEpochAmounts, lifetimeAmounts } =
    calculateSubsequentTransactionSummary(loanTickets || [], currentEpoch)

  return (
    <>
      <SubsequentTransactionsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-2'
        )}
        tooltipInfo={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-2-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.pendingDecisionAmount, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.pendingDecisionAmount, { minDecimals: 2 })} USDC`}
      />
      <SubsequentTransactionsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-3'
        )}
        tooltipInfo={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-3-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.optedInAmount, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.optedInAmount, { minDecimals: 2 })} USDC`}
      />
      <SubsequentTransactionsTableRow
        title={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-4'
        )}
        tooltipInfo={t(
          'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-4-tooltip'
        )}
        currentEpochValue={`${formatAmount(currentEpochAmounts.optedOutAmount, { minDecimals: 2 })} USDC`}
        totalLifetimeValue={`${formatAmount(lifetimeAmounts.optedOutAmount, { minDecimals: 2 })} USDC`}
      />
    </>
  )
}
export default SubsequentTransactionsTableBody
