import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

const PendingTransactionRequestsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <>
      <TableRow
        sx={{
          '.MuiTableCell-root': {
            py: 1,
            textTransform: 'capitalize',
          },
        }}
      >
        <TableCell width='35%'>{t('general.lendingStrategy')}</TableCell>
        <TableCell width='23%' align='right'>
          {t('general.tranche')}
        </TableCell>
        <TableCell align='right' width='17%'>
          {t('lite.pendingTransactionRequests.requestType')}
        </TableCell>
        <TableCell align='right' width='25%'>
          {t('general.requested')}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} padding='none'>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}
export default PendingTransactionRequestsTableHeader
