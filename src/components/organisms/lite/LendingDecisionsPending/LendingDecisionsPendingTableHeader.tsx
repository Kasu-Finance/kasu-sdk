import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

const LendingDecisionsPendingTableHeader = () => {
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
        <TableCell>{t('general.lendingStrategy')}</TableCell>
        <TableCell align='right'>{t('general.tranche')}</TableCell>
        <TableCell align='right'>{t('general.timeRemainig')}</TableCell>
        <TableCell align='right'>
          {t('lite.lendingDecisionsPending.decisionPending')}
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

export default LendingDecisionsPendingTableHeader
