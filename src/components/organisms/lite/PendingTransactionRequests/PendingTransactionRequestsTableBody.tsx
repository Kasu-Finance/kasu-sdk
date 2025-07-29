import { TableCell, TableRow } from '@mui/material'
import React, { Fragment } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'
import PendingTransactionRequestsTableRow from '@/components/organisms/lite/PendingTransactionRequests/PendingTransactionRequestsTableRow'

import { PendingTransactions } from '@/utils/lending/getPendingTransactionRequests'

type PendingTransactionRequestsTableBodyProps = {
  pendingTransactions: PendingTransactions[]
}

const PendingTransactionRequestsTableBody: React.FC<
  PendingTransactionRequestsTableBodyProps
> = ({ pendingTransactions }) => {
  return pendingTransactions.map(
    ({ lendingPool, requestType, requestedAmount, trancheName }, index) => (
      <Fragment key={index}>
        <PendingTransactionRequestsTableRow
          poolName={lendingPool.name}
          requestType={requestType}
          requestedAmount={requestedAmount}
          tranche={trancheName}
        />
        <TableRow>
          <TableCell colSpan={4} padding='none'>
            <DottedDivider />
          </TableCell>
        </TableRow>
      </Fragment>
    )
  )
}

export default PendingTransactionRequestsTableBody
