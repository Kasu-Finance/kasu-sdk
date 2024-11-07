import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { customTypography } from '@/themes/typography'

const LendingPortfolioTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          ...customTypography.baseSm,
        },
      }}
    >
      <TableCell sx={{ textTransform: 'capitalize' }} width='19%'>
        {t('general.lendingStrategy')}
      </TableCell>
      <TableCell width='9%'>{t('general.grossApy')}</TableCell>
      <TableCell width='10%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-1')}
      </TableCell>
      <TableCell width='12%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-2')}
      </TableCell>
      <TableCell width='16%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-3')}
      </TableCell>
      <TableCell width='14%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-4')}
      </TableCell>
      <TableCell width='20%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-5')}
      </TableCell>
    </TableRow>
  )
}

export default LendingPortfolioTableHeader
