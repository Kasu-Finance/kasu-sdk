import { TableCell, TableRow, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const WithdrawalRequestsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <TableCell width='50%'>
        <Typography variant='h5'>
          {t(
            'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.title'
          )}
        </Typography>
      </TableCell>
      <TableCell width='22%' align='right'>
        <Typography variant='baseMdBold'>
          {t('general.currentEpoch')}
        </Typography>
      </TableCell>
      <TableCell width='28%' align='right'>
        <Typography variant='baseMdBold'>
          {t('general.totalLifetime')}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default WithdrawalRequestsTableHeader
