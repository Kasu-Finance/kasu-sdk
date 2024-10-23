import useTranslation from '@/hooks/useTranslation'

import CustomTable from '@/components/molecules/CustomTable'
import LendingRequestsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingRequests/LendingRequestsTableHeader'
import LendingRequestsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingRequests/LendingRequestsTableRow'

import { customPalette } from '@/themes/palette'
import { formatAmount } from '@/utils'

const LendingRequests = () => {
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
      tableHeader={<LendingRequestsTableHeader />}
      tableBody={
        <>
          <LendingRequestsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-1'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-1-tooltip'
            )}
            currentEpochValue={`${formatAmount(10_000, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(10_000, { minDecimals: 2 })} USDC`}
          />
          <LendingRequestsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-2-tooltip'
            )}
            currentEpochValue={`${formatAmount(8_000, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(8_000, { minDecimals: 2 })} USDC`}
          />
          <LendingRequestsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-3-tooltip'
            )}
            currentEpochValue={`${formatAmount(1_000, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(1_000, { minDecimals: 2 })} USDC`}
          />
          <LendingRequestsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-4'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-4-tooltip'
            )}
            currentEpochValue={`${formatAmount(500, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(500, { minDecimals: 2 })} USDC`}
          />
          <LendingRequestsTableRow
            title={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-5'
            )}
            tooltipInfo={t(
              'portfolio.transactions.lendingStatusSummary.lendingRequests.metric-5-tooltip'
            )}
            currentEpochValue={`${formatAmount(500, { minDecimals: 2 })} USDC`}
            totalLifetimeValue={`${formatAmount(500, { minDecimals: 2 })} USDC`}
          />
        </>
      }
    />
  )
}

export default LendingRequests
