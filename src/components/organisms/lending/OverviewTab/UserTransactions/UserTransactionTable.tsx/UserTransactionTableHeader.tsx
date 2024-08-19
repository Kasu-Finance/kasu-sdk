import { TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const UserTransactionTableHeader = () => {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell width='17%'>{t('general.request')}</TableCell>
      <TableCell width='14%'>{t('general.tranche')}</TableCell>
      <TableCell width='15%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.requested')}
      </TableCell>
      <TableCell width='15%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.accepted')}
      </TableCell>
      <TableCell width='15%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.rejected')}
      </TableCell>
      <TableCell width='12%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.requestdate')}
      </TableCell>
      <TableCell width='12%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.status')}
      </TableCell>
    </TableRow>
  )
}

export default UserTransactionTableHeader
