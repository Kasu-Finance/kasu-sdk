import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'
import TimeConversions from '@/utils/timeConversions'

type Amounts = {
  requested: number
  accepted: number
  rejected: number
  reallocated: number
}

const initialState: Amounts = {
  accepted: 0,
  requested: 0,
  rejected: 0,
  reallocated: 0,
}

const calculateLendingStatusSummary = (
  detailedTransactions: DetailedTransaction[],
  nextEpochTime: number
) => {
  const currentEpochAmounts: Amounts = { ...initialState }
  const lifetimeAmounts: Amounts = { ...initialState }

  const currentEpochStartTime = nextEpochTime - TimeConversions.SECONDS_PER_WEEK

  for (const transaction of detailedTransactions) {
    if (transaction.requestType === 'Withdrawal') continue

    const isCurrentEpoch = transaction.timestamp > currentEpochStartTime

    if (transaction.requestType === 'Reallocation') {
      lifetimeAmounts.reallocated += parseFloat(transaction.reallocatedInAmount)

      if (isCurrentEpoch) {
        currentEpochAmounts.reallocated += parseFloat(
          transaction.reallocatedInAmount
        )
      }
    } else {
      lifetimeAmounts.accepted += parseFloat(transaction.acceptedAmount)
      lifetimeAmounts.rejected += parseFloat(transaction.rejectedAmount)
      lifetimeAmounts.requested += parseFloat(transaction.requestedAmount)

      if (isCurrentEpoch) {
        currentEpochAmounts.accepted += parseFloat(transaction.acceptedAmount)
        currentEpochAmounts.rejected += parseFloat(transaction.rejectedAmount)
        currentEpochAmounts.requested += parseFloat(transaction.requestedAmount)
      }
    }
  }

  return { currentEpochAmounts, lifetimeAmounts }
}

export default calculateLendingStatusSummary
