import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTable from '@/components/molecules/CustomTable'
import WithdrawalRequestsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary/WithdrawalRequestsTableHeader'
import WithdrawalRequestsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary/WithdrawalRequestsTableRow'

import { customPalette } from '@/themes/palette'
import { formatAmount } from '@/utils'

const WithdrawalStatusSummary = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('portfolio.transactions.withdrawalStatusSummary.title')}
      />
      <CustomInnerCardContent>
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
          tableHeader={<WithdrawalRequestsTableHeader />}
          tableBody={
            <>
              <WithdrawalRequestsTableRow
                title={t(
                  'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-1'
                )}
                tooltipInfo={t(
                  'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-1-tooltip'
                )}
                currentEpochValue={`${formatAmount(10_000, { minDecimals: 2 })} USDC`}
                totalLifetimeValue={`${formatAmount(10_000, { minDecimals: 2 })} USDC`}
              />
              <WithdrawalRequestsTableRow
                title={t(
                  'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2'
                )}
                tooltipInfo={t(
                  'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2-tooltip'
                )}
                currentEpochValue={`${formatAmount(8_000, { minDecimals: 2 })} USDC`}
                totalLifetimeValue='N/A'
              />
              <WithdrawalRequestsTableRow
                title={t(
                  'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3'
                )}
                tooltipInfo={t(
                  'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3-tooltip'
                )}
                currentEpochValue={`${formatAmount(1_000, { minDecimals: 2 })} USDC`}
                totalLifetimeValue={`${formatAmount(1_000, { minDecimals: 2 })} USDC`}
              />
              <WithdrawalRequestsTableRow
                title={t(
                  'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-4'
                )}
                tooltipInfo={t(
                  'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-4-tooltip'
                )}
                currentEpochValue={`${formatAmount(500, { minDecimals: 2 })} USDC`}
                totalLifetimeValue='N/A'
              />
            </>
          }
        />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default WithdrawalStatusSummary
