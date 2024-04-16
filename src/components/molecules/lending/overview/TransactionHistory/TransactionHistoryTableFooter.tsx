import { Box, TableCell, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

const TransactionHistoryTableFooter = () => {
  return (
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
          amount={formatAmount(formatEther('1000'))}
          symbol='USDC'
        />
      </Box>
    </TableCell>
  )
}

export default TransactionHistoryTableFooter
