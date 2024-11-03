import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'
import TimeConversions from '@/utils/timeConversions'

type Amounts = {
  requested: number
  accepted: number
  queued: number
}

const initialState: Amounts = {
  accepted: 0,
  requested: 0,
  queued: 0,
}

const calculateWithdrawalStatusSummary = (
  detailedTransactions: DetailedTransaction[],
  nextEpochTime: number
) => {
  const currentEpochAmounts: Amounts = { ...initialState }
  const lifetimeAmounts: Amounts = { ...initialState }

  const currentEpochStartTime = nextEpochTime - TimeConversions.SECONDS_PER_WEEK

  for (const transaction of detailedTransactions) {
    if (transaction.requestType !== 'Withdrawal') continue

    const isCurrentEpoch = transaction.timestamp > currentEpochStartTime

    lifetimeAmounts.accepted += parseFloat(transaction.acceptedAmount)
    lifetimeAmounts.requested += parseFloat(transaction.requestedAmount)

    if (isCurrentEpoch) {
      currentEpochAmounts.accepted += parseFloat(transaction.acceptedAmount)
      currentEpochAmounts.requested += parseFloat(transaction.requestedAmount)
      currentEpochAmounts.queued += parseFloat(transaction.queuedAmount)
    }
  }

  return { currentEpochAmounts, lifetimeAmounts }
}

export default calculateWithdrawalStatusSummary
