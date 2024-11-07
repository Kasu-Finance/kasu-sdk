import { TableCell, TableRow, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

const FixedLoanTableRow = () => {
  const { t } = getTranslation()

  return (
    <>
      <TableRow
        sx={{
          '.MuiTableCell-root': {
            pt: 0,
          },
        }}
      >
        <TableCell>{dayjs().format('DD.MM.YYYY')}</TableCell>
        <TableCell>{formatAmount(20_000, { minDecimals: 2 })} USDC</TableCell>
        <TableCell>
          {t('modals.fixedLoan.fixedUntil')} {dayjs().format('DD.MM.YYYY')}
          <Typography display='inline' color='error'>
            *
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={3} sx={{ pt: 0 }}>
          <DottedDivider color='white' />
        </TableCell>
      </TableRow>
    </>
  )
}

export default FixedLoanTableRow
