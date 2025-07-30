import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

const LockingRewardsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <>
      <TableRow
        sx={{
          '.MuiTableCell-root': {
            py: 1,
          },
        }}
      >
        {' '}
        <TableCell width='40%'>
          {t('portfolio.rewards.bonusesAndRewards')}
        </TableCell>
        <TableCell width='30%' align='right'>
          {t('general.lifetimeRewards')}
        </TableCell>
        <TableCell width='30%' align='right'>
          {t('general.claimableRewards')}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={3} padding='none'>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default LockingRewardsTableHeader
