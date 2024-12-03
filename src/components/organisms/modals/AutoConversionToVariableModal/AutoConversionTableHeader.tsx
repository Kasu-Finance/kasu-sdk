import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const AutoConversionTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
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

export default AutoConversionTableHeader
