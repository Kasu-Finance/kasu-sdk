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

          '&:not(:first-child):not(:last-child)': {
            px: 1,
          },
        },
      }}
    >
      <TableCell width='13%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-1'
        )}
      </TableCell>
      <TableCell width='27%'>{t('general.lendingStrategy')}</TableCell>

      <TableCell width='10%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-2'
        )}
      </TableCell>
      <TableCell width='18%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-3'
        )}
      </TableCell>
      <TableCell width='17%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-4'
        )}
      </TableCell>
      <TableCell width='15%'>
        {t(
          'portfolio.transactions.detailedLendingRequestTransactions.tableHeader.cell-5'
        )}
      </TableCell>
    </TableRow>
  )
}

export default PortfolioUserTransactionsTableHeader
