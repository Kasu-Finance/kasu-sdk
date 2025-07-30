import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

const LiteReferralBonusTableHeader = () => {
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
        <TableCell width='30%'>
          {t('lite.referralBonus.table.cell-1')}
        </TableCell>
        <TableCell width='25%' align='right'>
          {t('lite.referralBonus.table.cell-2')}
        </TableCell>
        <TableCell width='25%' align='right'>
          {t('lite.referralBonus.table.cell-3')}
        </TableCell>
        <TableCell width='20%' align='right'>
          {t('lite.referralBonus.table.cell-4')}
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

export default LiteReferralBonusTableHeader
