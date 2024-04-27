import { alpha, Box, TableCell, TableRow, Typography } from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount, toBigNumber } from '@/utils'

type TransactionHistoryTableFooterProps = {
  transactionHistory: UserRequest[]
}

const TransactionHistoryTableFooter: React.FC<
  TransactionHistoryTableFooterProps
> = ({ transactionHistory }) => {
  const total = transactionHistory.reduce((acc, cur) => {
    return acc.add(toBigNumber(cur.acceptedAmount))
  }, BigNumber.from(0))

  return (
    <TableRow
      sx={(theme) => ({
        background: alpha(theme.palette.primary.main, 0.08),
      })}
    >
      <TableCell padding='none' colSpan={6}>
        <Box px={2}>
          <Typography
            variant='subtitle2'
            component='span'
            display='block'
            py='6px'
          >
            Total
          </Typography>
          <TokenAmount
            py='6px'
            amount={formatAmount(formatEther(total))}
            symbol='USDC'
          />
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default TransactionHistoryTableFooter
