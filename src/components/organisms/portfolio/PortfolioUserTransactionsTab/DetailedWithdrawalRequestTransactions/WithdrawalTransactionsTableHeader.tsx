import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { customTypography } from '@/themes/typography'

const WithdrawalTransactionsTableHeader = () => {
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
      <TableCell width='14%'>
        {t(
          'portfolio.transactions.detailedWithdrawalRequestTransaction.tableHeader.cell-1'
        )}
      </TableCell>
      <TableCell width='32%'>{t('general.lendingStrategy')}</TableCell>

      <TableCell width='8%'>
        {t(
          'portfolio.transactions.detailedWithdrawalRequestTransaction.tableHeader.cell-2'
        )}
      </TableCell>
      <TableCell width='28%'>
        {t(
          'portfolio.transactions.detailedWithdrawalRequestTransaction.tableHeader.cell-3'
        )}
      </TableCell>
      <TableCell width='18%'>
        {t(
          'portfolio.transactions.detailedWithdrawalRequestTransaction.tableHeader.cell-4'
        )}
      </TableCell>
    </TableRow>
  )
}

export default WithdrawalTransactionsTableHeader
