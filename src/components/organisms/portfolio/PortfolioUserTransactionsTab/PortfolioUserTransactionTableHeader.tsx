import { TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const PortfolioUserTransactionsTableHeader = () => {
  const { t } = useTranslation()

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          textTransform: 'capitalize',
        },
      }}
    >
      <TableCell width='34%'>{t('general.lendingStrategy')}</TableCell>
      <TableCell width='12%'>{t('general.request')}</TableCell>
      <TableCell width='10%'>{t('general.tranche')}</TableCell>
      <TableCell width='18%'>{t('general.amounts')}</TableCell>
      <TableCell width='10%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.requestdate')}
      </TableCell>
      <TableCell width='16%'>
        {t('lending.poolOverview.transactionsHistory.tableHeader.status')}
      </TableCell>
    </TableRow>
  )
}

export default PortfolioUserTransactionsTableHeader
