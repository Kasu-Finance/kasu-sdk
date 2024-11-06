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
      <TableCell sx={{ textTransform: 'capitalize' }} width='26%'>
        {t('general.lendingStrategy')}
      </TableCell>
      <TableCell width='9%'>{t('general.grossApy')}</TableCell>
      <TableCell width='10%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-1')}
      </TableCell>
      <TableCell width='13%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-2')}
      </TableCell>
      <TableCell width='16%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-3')}
      </TableCell>
      <TableCell width='15%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-4')}
      </TableCell>
      <TableCell width='11%'>
        {t('portfolio.lendingPortfolio.tableHeader.cell-5')}
      </TableCell>
    </TableRow>
  )
}

export default LendingPortfolioTableHeader
