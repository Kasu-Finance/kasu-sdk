import { PortfolioTranche } from '@kasufinance/kasu-sdk'
import { Box, Radio, TableCell, TableRow } from '@mui/material'
import { ChangeEvent, Dispatch, SetStateAction } from 'react'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

import dayjs from '@/dayjs'
import { customPalette } from '@/themes/palette'
import { formatAmount } from '@/utils'

type WithdrawFundsAtExpiryTableRowProps = {
  fixedLoan: PortfolioTranche['fixedLoans'][number]
  fixedTermDepositId: string
  setFixedTermDeposit: Dispatch<SetStateAction<string>>
}

const WithdrawFundsAtExpiryTableRow: React.FC<
  WithdrawFundsAtExpiryTableRowProps
> = ({ fixedLoan, fixedTermDepositId, setFixedTermDeposit }) => {
  const { t } = getTranslation()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFixedTermDeposit(event.target.value)
  }

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
          <Radio
            sx={{ p: 0, mr: 1 }}
            checked={fixedTermDepositId === fixedLoan.lockId}
            value={fixedLoan.lockId}
            onChange={handleChange}
            checkedIcon={
              <Box
                width={24}
                height={24}
                borderRadius='50%'
                bgcolor='gold.middle'
                border={`6px solid ${customPalette.gray.extraDark}`}
              />
            }
            icon={
              <Box width={24} height={24} borderRadius='50%' bgcolor='white' />
            }
          />
        </TableCell>
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
        <TableCell colSpan={4} sx={{ pt: 0 }}>
          <DottedDivider color='white' />
        </TableCell>
      </TableRow>
    </>
  )
}

export default WithdrawFundsAtExpiryTableRow
