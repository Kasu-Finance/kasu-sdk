import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { customTypography } from '@/themes/typography'

const PendingDecisionsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow sx={{ '.MuiTableCell-root': { ...customTypography.baseMdBold } }}>
      <TableCell width='12%'>
        {t('modals.pendingDecisions.tableHeader.cell-1')}
      </TableCell>
      <TableCell width='18%'>
        {t('modals.pendingDecisions.tableHeader.cell-2')}
      </TableCell>
      <TableCell width='25%'>
        {t('modals.pendingDecisions.tableHeader.cell-3')}
      </TableCell>
      <TableCell width='28%'>
        {t('modals.pendingDecisions.tableHeader.cell-4')}
      </TableCell>
      <TableCell width='17%'>
        {t('modals.pendingDecisions.tableHeader.cell-5')}
      </TableCell>
    </TableRow>
  )
}

export default PendingDecisionsTableHeader
