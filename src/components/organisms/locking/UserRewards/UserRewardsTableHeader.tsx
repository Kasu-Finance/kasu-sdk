import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const UserRewardsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          whiteSpace: 'normal',
        },
      }}
    >
      <TableCell
        width='
      12%'
      >
        {t('locking.widgets.unlock.table.headers.amountLocked')}
      </TableCell>
      <TableCell width='36%'>
        {t('locking.widgets.unlock.table.headers.dateLocked')}
      </TableCell>
      <TableCell width='16%'>
        {t('locking.widgets.unlock.table.headers.unlockDate')}
      </TableCell>
      <TableCell width='12%'>
        {t('locking.widgets.unlock.table.headers.remainingDuration')}
      </TableCell>
      <TableCell width='12%'>
        {t('locking.widgets.unlock.table.headers.multiplier')}
      </TableCell>
      <TableCell width='12%'>
        {t('locking.widgets.unlock.table.headers.balance')}
      </TableCell>
    </TableRow>
  )
}

export default UserRewardsTableHeader
