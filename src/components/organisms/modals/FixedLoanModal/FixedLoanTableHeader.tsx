import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const FixedLoanTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          whiteSpace: 'normal',
        },
      }}
    >
      <TableCell width='25%'>
        {t('modals.fixedLoan.tableHeader.cell-1')}
      </TableCell>
      <TableCell width='40%'>
        {t('modals.fixedLoan.tableHeader.cell-2')}
      </TableCell>
      <TableCell width='45%'>
        {t('modals.fixedLoan.tableHeader.cell-3')}
      </TableCell>
    </TableRow>
  )
}

export default FixedLoanTableHeader
