import { Box, TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'

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
      <TableCell width='18%'>{t('general.lendingStrategy')}</TableCell>
      <TableCell width='10%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-1')}
      </TableCell>
      <TableCell width='12%'>
        <Box display='flex' alignItems='center'>
          {t('portfolio.transactions.detailedTransactions.tableHeader.cell-2')}
          <ToolTip
            title={
              <>
                This column refers to the initial transaction phase of a single
                transaction type, being funds received into a Lending Strategy
                and an associated tranche, and/or funds being returned to the
                Lender from a Lending Strategy.
                <br />
                <br />
                To gain a more granular view of the status of your funds post
                the initial transaction phase, please click on the ‘View
                Details’ link.
              </>
            }
          />
        </Box>
      </TableCell>
      <TableCell width='11%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-3')}
      </TableCell>
      <TableCell width='21%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-4')}
      </TableCell>
      <TableCell width='15%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-5')}
      </TableCell>
      <TableCell width='15%'>
        {t('portfolio.transactions.detailedTransactions.tableHeader.cell-6')}
      </TableCell>
    </TableRow>
  )
}

export default PortfolioUserTransactionsTableHeader
