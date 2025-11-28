import { Stack, Table, TableBody, Typography } from '@mui/material'
import { Fragment } from 'react'

import SystemProcessHistoryRow from '@/components/organisms/modals/RequestDetailsModal/SystemProcessHistory/SystemProcessHistoryRow'
import TraansactionHistoryTableHeader from '@/components/organisms/modals/RequestDetailsModal/SystemProcessHistory/SystemProcessHistoryTableHeader'

import {
  DetailedTransactionReallocationRequest,
  DetailedTransactionWrapper,
} from '@/utils/lending/getDetailedTransactions'
import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type SystemProcessHistoryProps = {
  transaction:
    | WithdrawalTransactionWrapper
    | DetailedTransactionWrapper
    | DetailedTransactionReallocationRequest
  currentEpoch: string
}

const getReallocateFromTranscheName = (trancheName: string) => {
  switch (trancheName) {
    case 'Senior':
      return 'Mezzanine'
    case 'Mezzanine':
      return 'Junior'
    default:
      return ''
  }
}

const getReallocatedOutTrancheName = (trancheName: string) => {
  switch (trancheName) {
    case 'Junior':
      return 'Mezzanine'
    case 'Mezzanine':
      return 'Senior'
    default:
      return ''
  }
}

const getDescription = (
  event:
    | DetailedTransactionWrapper['events'][number]
    | WithdrawalTransactionWrapper['events'][number]
) => {
  if ('remainingQueuedAmount' in event) {
    if (event.status === 'Forced') {
      return 'Forced Withdrawal'
    } else if (event.status === 'Requested') {
      return 'New Withdrawal Request'
    } else {
      return parseFloat(event.remainingQueuedAmount) <= 0
        ? 'Full Withdrawal Accepted'
        : 'Partial Withdrawal Accepted'
    }
  }

  switch (event.type) {
    case 'Request':
      return 'New Lending Request'
    case 'Accepted':
    case 'Rejected':
      return event.type
    case 'Reallocated':
      return `Reallocated Out to ${getReallocatedOutTrancheName(event.trancheName)} Tranche`
  }
}

const getStatus = (
  event: DetailedTransactionWrapper['events'][number],
  currentTrancheName: string
) => {
  switch (event.type) {
    case 'Request':
      return event.status === 'Processed'
        ? 'Cleared - Delegate Decision Completed'
        : 'Queued - Awaiting Delegate Decision'
    case 'Accepted':
      return 'Accepted by Delegate'
    case 'Rejected':
      return 'Funds Returned - Delegate has Excess Liquidity'
    case 'Reallocated':
      return `${currentTrancheName} Tranche Full/Overflow`
  }
}

const SystemProcessHistory: React.FC<SystemProcessHistoryProps> = ({
  transaction,
  currentEpoch,
}) => {
  const isReallocation = 'id' in transaction

  const isProcessed = isReallocation
    ? true
    : transaction.transactions[0].requestStatus === 'Processed'

  return (
    <Stack spacing={2}>
      {isReallocation ||
        (transaction.type === 'Deposit' && (
          <Typography variant='h4'>
            Lending Request Transaction Status/Outcome
          </Typography>
        ))}
      <Table>
        <TraansactionHistoryTableHeader
          showBorder={
            isProcessed ||
            ('transactions' in transaction &&
              transaction.transactions.length > 1)
          }
          isWithdrawal={!isReallocation && transaction.type === 'Withdrawal'}
        />
        <TableBody>
          {isReallocation ? (
            <>
              {parseFloat(transaction.reallocatedOutAmount) > 0 && (
                <SystemProcessHistoryRow
                  amount={transaction.reallocatedOutAmount}
                  date={transaction.requestTimestamp}
                  transactionEpoch={transaction.epochId}
                  currentEpoch={currentEpoch}
                  tranasctionHash='hash'
                  description={`Reallocated Out to ${getReallocatedOutTrancheName(transaction.trancheName)} Tranche`}
                  status={`${transaction.trancheName} Tranche Full/Overflow`}
                />
              )}
              {parseFloat(transaction.rejectedAmount) > 0 && (
                <SystemProcessHistoryRow
                  amount={transaction.rejectedAmount}
                  date={transaction.requestTimestamp}
                  transactionEpoch={transaction.epochId}
                  currentEpoch={currentEpoch}
                  tranasctionHash={transaction.transactionHash}
                  description='Rejected'
                  status={`Funds Returned - ${transaction.trancheName} Tranche Full/Overflow`}
                />
              )}
              {parseFloat(transaction.acceptedAmount) > 0 && (
                <SystemProcessHistoryRow
                  amount={transaction.acceptedAmount}
                  date={transaction.requestTimestamp}
                  transactionEpoch={transaction.epochId}
                  currentEpoch={currentEpoch}
                  tranasctionHash={transaction.transactionHash}
                  description='Accepted'
                  status='Accepted by Delegate'
                />
              )}
              <SystemProcessHistoryRow
                amount={transaction.reallocatedInAmount}
                date={transaction.requestTimestamp}
                transactionEpoch={transaction.epochId}
                currentEpoch={currentEpoch}
                tranasctionHash={transaction.transactionHash}
                description={`Reallocated In from ${getReallocateFromTranscheName(transaction.trancheName)} Tranche`}
                status={`${getReallocateFromTranscheName(transaction.trancheName)} Tranche Full/Overflow`}
                highlight
              />
            </>
          ) : (
            [...transaction.events].reverse().map((event, index) => {
              return (
                <Fragment key={index}>
                  <SystemProcessHistoryRow
                    transactionEpoch={event.epochId}
                    currentEpoch={currentEpoch}
                    amount={event.amount}
                    date={event.timestamp}
                    tranasctionHash={event.transactionHash}
                    description={getDescription(event)}
                    remainingAmount={
                      'remainingQueuedAmount' in event
                        ? event.remainingQueuedAmount
                        : undefined
                    }
                    status={
                      'type' in event
                        ? getStatus(event, event.trancheName)
                        : undefined
                    }
                    highlight={
                      'remainingQueuedAmount' in event ||
                      event.type === 'Request'
                    }
                  />
                </Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
    </Stack>
  )
}

export default SystemProcessHistory
