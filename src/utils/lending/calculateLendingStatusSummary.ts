import {
  DetailedTransaction,
  DetailedTransactionReallocationRequest,
} from '@/utils/lending/getDetailedTransactions'
import TimeConversions from '@/utils/timeConversions'

type Amounts = {
  requested: number
  accepted: number
  rejected: number
  reallocated: number
  cancelled: number
}

const initialState: Amounts = {
  accepted: 0,
  requested: 0,
  rejected: 0,
  reallocated: 0,
  cancelled: 0,
}

const calculateLendingStatusSummary = (
  detailedTransactions: (
    | DetailedTransaction
    | DetailedTransactionReallocationRequest
  )[],
  nextEpochTime: number
) => {
  const currentEpochAmounts: Amounts = { ...initialState }
  const lifetimeAmounts: Amounts = { ...initialState }

  const currentEpochStartTime = nextEpochTime - TimeConversions.SECONDS_PER_WEEK

  for (const transaction of detailedTransactions) {
    if (
      transaction.requestType === 'Withdrawal' ||
      transaction.requestType === 'Funds Returned'
    )
      continue

    const isCurrentEpoch = transaction.timestamp > currentEpochStartTime

    if (transaction.requestType === 'Reallocation') {
      lifetimeAmounts.reallocated += parseFloat(transaction.reallocatedInAmount)

      if (isCurrentEpoch) {
        currentEpochAmounts.reallocated += parseFloat(
          transaction.reallocatedInAmount
        )
      }
    } else {
      if (transaction.latestEvent.requestType === 'Cancelled') {
        lifetimeAmounts.cancelled += parseFloat(
          transaction.latestEvent.assetAmount
        )

        if (transaction.latestEvent.timestamp > currentEpochStartTime) {
          currentEpochAmounts.cancelled += parseFloat(
            transaction.latestEvent.assetAmount
          )
        }
      }

      lifetimeAmounts.accepted += parseFloat(transaction.acceptedAmount)
      lifetimeAmounts.rejected += parseFloat(transaction.rejectedAmount)

      if (isCurrentEpoch) {
        currentEpochAmounts.accepted += parseFloat(transaction.acceptedAmount)
        currentEpochAmounts.rejected += parseFloat(transaction.rejectedAmount)
      }
    }
  }

  currentEpochAmounts.requested =
    currentEpochAmounts.accepted +
    currentEpochAmounts.rejected +
    currentEpochAmounts.reallocated
  lifetimeAmounts.requested =
    lifetimeAmounts.accepted +
    lifetimeAmounts.rejected +
    lifetimeAmounts.reallocated

  return { currentEpochAmounts, lifetimeAmounts }
}

export default calculateLendingStatusSummary
