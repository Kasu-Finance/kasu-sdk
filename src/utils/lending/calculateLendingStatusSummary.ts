import {
  DetailedTransactionReallocationRequest,
  DetailedTransactionWrapper,
} from '@/utils/lending/getDetailedTransactions'

type Amounts = {
  queued: number
  requested: number
  accepted: number
  rejected: number
  reallocated: number
  cancelled: number
}

const initialState: Amounts = {
  queued: 0,
  accepted: 0,
  requested: 0,
  rejected: 0,
  reallocated: 0,
  cancelled: 0,
}

const calculateLendingStatusSummary = (
  detailedTransactions: (
    | DetailedTransactionWrapper
    | DetailedTransactionReallocationRequest
  )[],
  currentEpoch: string
) => {
  const currentEpochAmounts: Amounts = { ...initialState }
  const lifetimeAmounts: Amounts = { ...initialState }

  for (const depositGroups of detailedTransactions) {
    if ('transactions' in depositGroups) {
      for (const transaction of depositGroups.transactions) {
        switch (transaction.requestStatus) {
          case 'Cancelled':
            if (transaction.epochId === currentEpoch) {
              currentEpochAmounts.cancelled += parseFloat(
                transaction.requestedAmount
              )
              currentEpochAmounts.requested += parseFloat(
                transaction.requestedAmount
              )
            }

            lifetimeAmounts.requested += parseFloat(transaction.requestedAmount)
            lifetimeAmounts.cancelled += parseFloat(transaction.requestedAmount)
            break
          case 'Requested':
            if (transaction.epochId === currentEpoch) {
              currentEpochAmounts.queued += parseFloat(
                transaction.requestedAmount
              )
              currentEpochAmounts.requested += parseFloat(
                transaction.requestedAmount
              )
            }

            lifetimeAmounts.requested += parseFloat(transaction.requestedAmount)
            break
          case 'Processed':
            if (
              parseFloat(transaction.epochId) ===
              parseFloat(currentEpoch) - 1
            ) {
              currentEpochAmounts.accepted += parseFloat(
                transaction.acceptedAmount
              )
              currentEpochAmounts.rejected += parseFloat(
                transaction.rejectedAmount
              )
              currentEpochAmounts.reallocated += parseFloat(
                transaction.reallocatedOutAmount
              )
            }

            lifetimeAmounts.requested +=
              parseFloat(transaction.acceptedAmount) +
              parseFloat(transaction.rejectedAmount)
            lifetimeAmounts.accepted += parseFloat(transaction.acceptedAmount)
            lifetimeAmounts.rejected += parseFloat(transaction.rejectedAmount)
            lifetimeAmounts.reallocated += parseFloat(
              transaction.reallocatedOutAmount
            )
            break
        }
      }
    } else {
      const reallocationTx = depositGroups
      if (parseFloat(reallocationTx.epochId) === parseFloat(currentEpoch) - 1) {
        currentEpochAmounts.accepted += parseFloat(
          reallocationTx.acceptedAmount
        )
        currentEpochAmounts.rejected += parseFloat(
          reallocationTx.rejectedAmount
        )
      }

      lifetimeAmounts.accepted += parseFloat(reallocationTx.acceptedAmount)
      lifetimeAmounts.rejected += parseFloat(reallocationTx.rejectedAmount)
    }
  }

  return { currentEpochAmounts, lifetimeAmounts }
}

export default calculateLendingStatusSummary
