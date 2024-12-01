import { TableCell, TableRow } from '@mui/material'

import { formatAmount } from '@/utils'

const RiskConcentrationsTableFooter = () => (
  <TableRow
    sx={(theme) => ({
      bgcolor: 'gray.extraLight',
      '.MuiTableCell-root': {
        ...theme.typography.baseMdBold,
      },
    })}
  >
    <TableCell>Total</TableCell>
    <TableCell>{formatAmount(0, { minDecimals: 2 })} USDC</TableCell>
    <TableCell>{formatAmount(0, { minDecimals: 2 })} USDC</TableCell>
    <TableCell>{formatAmount(0, { minDecimals: 2 })} USDC</TableCell>
    <TableCell>{formatAmount(0, { minDecimals: 2 })} USDC</TableCell>
    <TableCell>{formatAmount(0, { minDecimals: 2 })} USDC</TableCell>
    <TableCell>{formatAmount(0, { minDecimals: 2 })} USDC</TableCell>
    <TableCell>{formatAmount(0, { minDecimals: 2 })} USDC</TableCell>
  </TableRow>
)

export default RiskConcentrationsTableFooter
