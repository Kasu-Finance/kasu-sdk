import CustomTable from '@/components/molecules/CustomTable'
import LendingRequestsTableBody from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingRequests/LendingRequestsTableBody'
import LendingRequestsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingRequests/LendingRequestsTableHeader'

import { customPalette } from '@/themes/palette'

type LendingRequestsProps = {
  currentEpoch: string
}

const LendingRequests: React.FC<LendingRequestsProps> = ({ currentEpoch }) => {
  return (
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
      tableHeader={<LendingRequestsTableHeader />}
      tableBody={<LendingRequestsTableBody currentEpoch={currentEpoch} />}
    />
  )
}

export default LendingRequests
