import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type Amounts = {
  requested: number
  accepted: number
  queued: number
  cancelled: number
  forced: number
}

const initialState: Amounts = {
  accepted: 0,
  requested: 0,
  queued: 0,
  cancelled: 0,
  forced: 0,
}

const calculateWithdrawalStatusSummary = (
  detailedTransactions: WithdrawalTransactionWrapper[],
  currentEpoch: string
) => {
  const currentEpochAmounts: Amounts = { ...initialState }
  const lifetimeAmounts: Amounts = { ...initialState }

  for (const withdrawalGroup of detailedTransactions) {
    for (const withdrawalTx of withdrawalGroup.transactions) {
      if (withdrawalTx.epochId === currentEpoch) {
        if (withdrawalTx.requestStatus === 'Requested') {
          currentEpochAmounts.requested += parseFloat(
            withdrawalTx.requestedAmount
          )
          currentEpochAmounts.queued += parseFloat(withdrawalTx.requestedAmount)
        }

        if (withdrawalTx.requestStatus === 'Cancelled') {
          currentEpochAmounts.cancelled += parseFloat(
            withdrawalTx.requestedAmount
          )
          currentEpochAmounts.requested += parseFloat(
            withdrawalTx.requestedAmount
          )
        }
      }

      // for amounts that were processed "last week"
      if (parseFloat(withdrawalTx.epochId) === parseFloat(currentEpoch) - 1) {
        if (withdrawalTx.requestStatus === 'Processed') {
          currentEpochAmounts.requested += parseFloat(
            withdrawalTx.requestedAmount
          )
          currentEpochAmounts.accepted += parseFloat(
            withdrawalTx.acceptedAmount
          )
        }
      }

      if (withdrawalTx.requestStatus === 'Forced') {
        lifetimeAmounts.forced += parseFloat(withdrawalTx.acceptedAmount)
      }

      if (withdrawalTx.requestStatus === 'Processed') {
        lifetimeAmounts.requested += parseFloat(withdrawalTx.requestedAmount)
        lifetimeAmounts.accepted += parseFloat(withdrawalTx.acceptedAmount)
      }

      if (withdrawalTx.requestStatus === 'Requested') {
        lifetimeAmounts.requested += parseFloat(withdrawalTx.requestedAmount)
      }

      if (withdrawalTx.requestStatus === 'Cancelled') {
        lifetimeAmounts.cancelled += parseFloat(withdrawalTx.requestedAmount)
        lifetimeAmounts.requested += parseFloat(withdrawalTx.requestedAmount)
      }
    }
  }

  return { currentEpochAmounts, lifetimeAmounts }
}

export default calculateWithdrawalStatusSummary
