import { TableCell, TableRow } from '@mui/material'
import React from 'react'

import { formatAmount } from '@/utils'
import { PendingTransactions } from '@/utils/lending/getPendingTransactionRequests'

type PendingTransactionRequestsTableRowProps = {
  poolName: string
  tranche: string
  requestType: PendingTransactions['requestType']
  requestedAmount: string
}

const PendingTransactionRequestsTableRow: React.FC<
  PendingTransactionRequestsTableRowProps
> = ({ poolName, requestType, requestedAmount, tranche }) => {
  return (
    <TableRow sx={{ '.MuiTableCell-root': { py: 1 } }}>
      <TableCell>{poolName}</TableCell>
      <TableCell align='right'>{tranche}</TableCell>
      <TableCell align='right'>{requestType}</TableCell>
      <TableCell align='right'>
        {formatAmount(requestedAmount, { minDecimals: 2 })} USDC
      </TableCell>
    </TableRow>
  )
}

export default PendingTransactionRequestsTableRow
