import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'
import TimeConversions from '@/utils/timeConversions'

type Amounts = {
  requested: number
  accepted: number
  queued: number
  cancelled: number
}

const initialState: Amounts = {
  accepted: 0,
  requested: 0,
  queued: 0,
  cancelled: 0,
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

    lifetimeAmounts.requested += parseFloat(transaction.requestedAmount)

    if (isCurrentEpoch) {
      currentEpochAmounts.requested += parseFloat(transaction.requestedAmount)
      currentEpochAmounts.queued += parseFloat(transaction.queuedAmount)
    }

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
  }

  currentEpochAmounts.requested =
    currentEpochAmounts.accepted + currentEpochAmounts.queued
  lifetimeAmounts.requested = lifetimeAmounts.accepted + lifetimeAmounts.queued

  return { currentEpochAmounts, lifetimeAmounts }
}

export default calculateWithdrawalStatusSummary
