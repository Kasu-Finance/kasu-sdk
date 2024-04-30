import { Box, Divider, TableCell } from '@mui/material'
import React from 'react'

import TokenAmount from '@/components/atoms/TokenAmount'

type LendingPortfolioTableCellProps = {
  value: string
}

const LendingPortfolioTableCell: React.FC<LendingPortfolioTableCellProps> = ({
  value,
}) => (
  <TableCell sx={{ border: 'none', py: 0, height: 0 }} align='right'>
    <Box width='max-content' ml='auto' height='100%'>
      <TokenAmount
        amountVariant='body1'
        symbolVariant='caption'
        amount={value}
        symbol='USDC'
        height='100%'
        display='flex'
        alignItems='end'
        pb='6px'
      />
      <Divider />
    </Box>
  </TableCell>
)

export default LendingPortfolioTableCell
