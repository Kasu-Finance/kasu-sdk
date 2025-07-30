import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

const LiteLendingPortfolioTableHeader = () => {
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
        <TableCell width='30%'>{t('general.lendingStrategy')}</TableCell>
        <TableCell width='15%' align='left'>
          {t('general.tranche')}
        </TableCell>
        <TableCell width='20%' align='right'>
          {t('general.balance')}
        </TableCell>
        <TableCell width='15%' align='right'>
          {t('general.grossApy')}
        </TableCell>
        <TableCell width='20%' align='right'>
          {t('general.lifetimeInterest')}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} padding='none'>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default LiteLendingPortfolioTableHeader
