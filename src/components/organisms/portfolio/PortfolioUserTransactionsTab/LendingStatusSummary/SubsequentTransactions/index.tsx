import useTranslation from '@/hooks/useTranslation'

import CustomTable from '@/components/molecules/CustomTable'
import SubsequentTransactionsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/SubsequentTransactions/SubsequentTransactionsTableHeader'
import SubsequentTransactionsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/SubsequentTransactions/SubsequentTransactionsTableRow'

import { customPalette } from '@/themes/palette'
import { formatAmount } from '@/utils'

const SubsequentTransactions = () => {
  const { t } = useTranslation()

  return (
    <CustomTable
      tableSx={{ background: 'none' }}
      tableHeaderSx={{
        '& .MuiTableCell-root': {
          px: 0,
          borderBottom: `1px solid ${customPalette.gray.extraDark}`,
        },
      }}
      tableBodySx={{
        '& .MuiTableRow-root:first-child': {
          display: 'none',
        },
      }}
      tableHeader={<SubsequentTransactionsTableHeader />}
      tableBody={
        <>
          <SubsequentTransactionsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-1'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-1-tooltip'
            )}
            currentEpochValue={`${formatAmount(10_000, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(10_000, { minDecimals: 2 })} USDC`}
          />
          <SubsequentTransactionsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-2'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-2-tooltip'
            )}
            currentEpochValue={`${formatAmount(8_000, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(8_000, { minDecimals: 2 })} USDC`}
          />
          <SubsequentTransactionsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-3'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-3-tooltip'
            )}
            currentEpochValue={`${formatAmount(1_000, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(1_000, { minDecimals: 2 })} USDC`}
          />
          <SubsequentTransactionsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-4'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.metric-4-tooltip'
            )}
            currentEpochValue={`${formatAmount(500, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(500, { minDecimals: 2 })} USDC`}
          />
        </>
      }
    />
  )
}

export default SubsequentTransactions
