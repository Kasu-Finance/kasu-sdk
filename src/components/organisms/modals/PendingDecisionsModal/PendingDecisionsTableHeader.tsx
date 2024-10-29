import { TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import { customTypography } from '@/themes/typography'

const PendingDecisionsTableHeader = () => {
  const { t } = useTranslation()

  return (
    <TableRow sx={{ '.MuiTableCell-root': { ...customTypography.baseMdBold } }}>
      <TableCell width='17%'>
        {t('modals.pendingDecisions.tableHeader.cell-1')}
      </TableCell>
      <TableCell width='27%'>
        {t('modals.pendingDecisions.tableHeader.cell-2')}
      </TableCell>
      <TableCell width='32%'>
        {t('modals.pendingDecisions.tableHeader.cell-3')}
      </TableCell>
      <TableCell width='24%'>
        {t('modals.pendingDecisions.tableHeader.cell-4')}
      </TableCell>
    </TableRow>
  )
}

export default PendingDecisionsTableHeader
