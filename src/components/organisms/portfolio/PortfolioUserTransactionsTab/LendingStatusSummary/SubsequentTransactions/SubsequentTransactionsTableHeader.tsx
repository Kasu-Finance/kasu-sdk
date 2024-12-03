import { TableCell, TableRow, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const SubsequentTransactionsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <TableCell width='56%'>
        <Typography variant='h5'>
          {t(
            'portfolio.transactions.lendingStatusSummary.subsequentTransactions.title'
          )}{' '}
          <Typography variant='inherit' color='gray.middle' display='inline'>
            {t(
              'portfolio.transactions.lendingStatusSummary.subsequentTransactions.subtitle'
            )}
          </Typography>
        </Typography>
      </TableCell>
      <TableCell width='22%'>
        <Typography variant='baseMdBold'>
          {t('general.currentEpoch')}
        </Typography>
      </TableCell>
      <TableCell width='22%'>
        <Typography variant='baseMdBold'>
          {t('general.totalLifetime')}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default SubsequentTransactionsTableHeader
