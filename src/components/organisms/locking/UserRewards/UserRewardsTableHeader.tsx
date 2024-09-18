import { TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const UserRewardsTableHeader = () => {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell
        width='
      36%'
      >
        {t('locking.widgets.unlock.table.headers.amountLocked')}
      </TableCell>
      <TableCell width='15%'>
        {t('locking.widgets.unlock.table.headers.unlockDate')}
      </TableCell>
      <TableCell width='18%'>
        {t('locking.widgets.unlock.table.headers.remainingDuration.1')}{' '}
        {t('locking.widgets.unlock.table.headers.remainingDuration.2')}
      </TableCell>
      <TableCell width='15%'>
        {t('locking.widgets.unlock.table.headers.multiplier')}
      </TableCell>
      <TableCell width='16%'>
        {t('locking.widgets.unlock.table.headers.balance')}
      </TableCell>
    </TableRow>
  )
}

export default UserRewardsTableHeader
