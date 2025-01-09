import { Stack, Table, TableBody, Typography } from '@mui/material'
import { Fragment } from 'react'

import TransactionHistoryRow from '@/components/organisms/modals/RequestDetailsModal/SystemProcessHistory/SystemProcessHistoryRow'
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
    | WithdrawalTransactionWrapper['events'][number],
  isLast: boolean
) => {
  if ('remainingQueuedAmount' in event) {
    if (event.status === 'Requested') {
      return isLast
        ? 'Initial WIthdrawal Request'
        : 'Increased Withdrawal Request'
    } else {
      return parseFloat(event.remainingQueuedAmount) <= 0
        ? 'Full Withdrawal Accepted'
        : 'Partial Withdrawal Accepted'
    }
  }

  switch (event.type) {
    case 'Request':
      return isLast ? 'Initial Lending Request' : 'Increased Lending Request'
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
        <TableBody
          sx={{
            '.MuiTableRow-root:last-child .MuiTableCell-root': {
              background: 'url("/images/wave-dark-gold.png") repeat',

              '&:first-child': {
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
                pl: 0.5,
              },
              '&:last-child': {
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
                pr: 0.5,
              },
            },
          }}
        >
          {isReallocation ? (
            <>
              {parseFloat(transaction.reallocatedOutAmount) > 0 && (
                <TransactionHistoryRow
                  amount={transaction.reallocatedOutAmount}
                  date={transaction.requestTimestamp}
                  epochId={transaction.epochId}
                  tranasctionHash='hash'
                  description={`Reallocated Out to ${getReallocatedOutTrancheName(transaction.trancheName)} Tranche`}
                  status={`${transaction.trancheName} Tranche Full/Overflow`}
                />
              )}
              {parseFloat(transaction.rejectedAmount) > 0 && (
                <TransactionHistoryRow
                  amount={transaction.rejectedAmount}
                  date={transaction.requestTimestamp}
                  epochId={transaction.epochId}
                  tranasctionHash={transaction.transactionHash}
                  description='Rejected'
                  status={`Funds Returned - ${transaction.trancheName} Tranche Full/Overflow`}
                />
              )}
              {parseFloat(transaction.acceptedAmount) > 0 && (
                <TransactionHistoryRow
                  amount={transaction.acceptedAmount}
                  date={transaction.requestTimestamp}
                  epochId={transaction.epochId}
                  tranasctionHash={transaction.transactionHash}
                  description='Accepted'
                  status='Accepted by Delegate'
                />
              )}
              <TransactionHistoryRow
                amount={transaction.reallocatedInAmount}
                date={transaction.requestTimestamp}
                epochId={transaction.epochId}
                tranasctionHash={transaction.transactionHash}
                description={`Reallocated In from ${getReallocateFromTranscheName(transaction.trancheName)} Tranche`}
                status={`${getReallocateFromTranscheName(transaction.trancheName)} Tranche Full/Overflow`}
              />
            </>
          ) : (
            [...transaction.events]
              .reverse()
              .map((event, index, originalArray) => {
                return (
                  <Fragment key={index}>
                    <TransactionHistoryRow
                      epochId={event.epochId}
                      amount={event.amount}
                      date={event.timestamp}
                      tranasctionHash={event.transactionHash}
                      description={getDescription(
                        event,
                        index === originalArray.length - 1
                      )}
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
