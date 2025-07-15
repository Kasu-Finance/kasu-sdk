import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { customTypography } from '@/themes/typography'

const LendingRequestsTransactionsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          textTransform: 'capitalize',
          whiteSpace: 'normal',
          ...customTypography.baseSmBold,
          lineHeight: '18px',
          verticalAlign: 'bottom',

          '&:not(:first-child):not(:last-child)': {
            px: 1,
          },
        },
      }}
    >
      <TableCell width='20%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-1'
        )}
      </TableCell>

      <TableCell width='10%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-2'
        )}
      </TableCell>
      <TableCell width='38%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-3'
        )}
      </TableCell>
      <TableCell width='20%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-4'
        )}
      </TableCell>
      <TableCell width='20%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-5'
        )}
      </TableCell>
    </TableRow>
  )
}

export default LendingRequestsTransactionsTableHeader
