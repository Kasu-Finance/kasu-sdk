import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const LoanStatusTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <TableCell width='7%'>
        {t('repayments.loanStatus.tableHeader.cell-1')}
      </TableCell>
      <TableCell width='13%'>
        {t('repayments.loanStatus.tableHeader.cell-2')}
      </TableCell>
      <TableCell width='17%'>
        {t('repayments.loanStatus.tableHeader.cell-3')}
      </TableCell>
      <TableCell width='22%'>
        {t('repayments.loanStatus.tableHeader.cell-4')}
      </TableCell>
      <TableCell width='10%'>
        {t('repayments.loanStatus.tableHeader.cell-5')}
      </TableCell>
      <TableCell width='15%'>
        {t('repayments.loanStatus.tableHeader.cell-6')}
      </TableCell>
      <TableCell width='16%'>
        {t('repayments.loanStatus.tableHeader.cell-7')}
      </TableCell>
    </TableRow>
  )
}

export default LoanStatusTableHeader
