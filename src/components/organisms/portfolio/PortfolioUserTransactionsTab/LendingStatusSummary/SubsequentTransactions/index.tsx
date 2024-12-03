import CustomTable from '@/components/molecules/CustomTable'
import SubsequentTransactionsTableBody from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/SubsequentTransactions/SubsequentTransactionsTableBody'
import SubsequentTransactionsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/SubsequentTransactions/SubsequentTransactionsTableHeader'

import { customPalette } from '@/themes/palette'

type SubsequentTransactionsProps = {
  currentEpoch: string
}

const SubsequentTransactions: React.FC<SubsequentTransactionsProps> = ({
  currentEpoch,
}) => {
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
        <SubsequentTransactionsTableBody currentEpoch={currentEpoch} />
      }
    />
  )
}

export default SubsequentTransactions
