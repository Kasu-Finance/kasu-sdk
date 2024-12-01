import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const UserTransactionTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <TableCell width='17%'>{t('general.request')}</TableCell>
      <TableCell width='12%'>{t('general.tranche')}</TableCell>
      <TableCell width='14%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.requested')}
      </TableCell>
      <TableCell width='14%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.accepted')}
      </TableCell>
      <TableCell width='14%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.rejected')}
      </TableCell>
      <TableCell width='13%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.requestdate')}
      </TableCell>
      <TableCell width='16%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.status')}
      </TableCell>
    </TableRow>
  )
}

export default UserTransactionTableHeader
