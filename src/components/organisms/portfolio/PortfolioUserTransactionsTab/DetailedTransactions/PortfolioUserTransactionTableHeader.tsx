import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { customTypography } from '@/themes/typography'

const PortfolioUserTransactionsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          textTransform: 'capitalize',
          whiteSpace: 'normal',
          ...customTypography.baseSm,
          lineHeight: '18px',
          verticalAlign: 'bottom',
          px: 1.5,
        },
      }}
    >
      <TableCell width='22%'>{t('general.lendingStrategy')}</TableCell>
      <TableCell width='10%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-1')}
      </TableCell>
      <TableCell width='11%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-2')}
      </TableCell>
      <TableCell width='11%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-3')}
      </TableCell>
      <TableCell width='19%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-4')}
      </TableCell>
      <TableCell width='15%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-5')}
      </TableCell>
      <TableCell width='12%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-6')}
      </TableCell>
    </TableRow>
  )
}

export default PortfolioUserTransactionsTableHeader
