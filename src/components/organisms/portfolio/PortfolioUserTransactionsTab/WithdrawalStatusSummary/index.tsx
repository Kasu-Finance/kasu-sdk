import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import CustomTable from '@/components/molecules/CustomTable'
import WithdrawalRequestsTableBody from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary/WithdrawalRequestsTableBody'
import WithdrawalRequestsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary/WithdrawalRequestsTableHeader'

import { customPalette } from '@/themes/palette'

const WithdrawalStatusSummary = () => {
  const { t } = getTranslation()

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
              borderBottom: `1px solid ${customPalette.gray.extraDark}`,

              '&:first-child': {
                pl: 0,
              },
            },
          }}
          tableBodySx={{
            '& .MuiTableRow-root:first-child': {
              display: 'none',
            },
          }}
          tableHeader={<WithdrawalRequestsTableHeader />}
          tableBody={<WithdrawalRequestsTableBody />}
        />
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default WithdrawalStatusSummary
