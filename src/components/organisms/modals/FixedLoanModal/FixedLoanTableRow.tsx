import { PortfolioTranche } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

type FixedLoanTableRowProps = {
  fixedLoan: PortfolioTranche['fixedLoans'][number]
}

const FixedLoanTableRow: React.FC<FixedLoanTableRowProps> = ({ fixedLoan }) => {
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
        <TableCell>
          {dayjs.unix(fixedLoan.startTime).format('DD.MM.YYYY')}
        </TableCell>
        <TableCell>
          {formatAmount(fixedLoan.amount, { minDecimals: 2 })} USDC
        </TableCell>
        <TableCell>
          {t('modals.fixedLoan.fixedUntil')}{' '}
          {dayjs.unix(fixedLoan.endTime).format('DD.MM.YYYY')}
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
