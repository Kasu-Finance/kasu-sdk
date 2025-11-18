import {
  UserRequest,
  UserRequestEvent,
} from '@solidant/kasu-sdk/src/services/UserLending/types'

export type PendingTransactions = {
  id: string
  lendingPool: {
    id: string
    name: string
    tranches: {
      orderId: string
    }[]
  }
  trancheName: string
  trancheId: string
  requestType: 'Lending' | 'Withdrawal'
  requestedAmount: string
}
const getPendingTransactionRequests = (transactionHistory: UserRequest[]) => {
  const pendingTransactions: PendingTransactions[] = []

  for (const transaction of transactionHistory) {
    const isProcessed = transaction.events.find(
      (event) =>
        event.requestType !== 'Initiated' && event.requestType !== 'Increased'
    )

    if (isProcessed) {
      if (transaction.requestType === 'Deposit') continue

      const initialWithdrawalEvents = transaction.events.filter(
        (event) =>
          event.requestType === 'Initiated' || event.requestType === 'Increased'
      )

      // parsing to prevent original array from being mutate later
      // https://stackoverflow.com/questions/66845607/array-is-getting-mutated-even-after-using-spread-operator
      const acceptedWithdrawalEvents: UserRequestEvent[] = JSON.parse(
        JSON.stringify(
          transaction.events.filter((event) => event.requestType === 'Accepted')
        )
      )

      if (!acceptedWithdrawalEvents.length) continue

      for (const withdrawalEvent of initialWithdrawalEvents) {
        const requestedAmount = parseFloat(withdrawalEvent.assetAmount)

        let lastAcceptedAmount = 0
        let acceptedAmount = 0
        let queuedAmount = requestedAmount

        for (let i = 0; i < acceptedWithdrawalEvents.length; i++) {
          const acceptedEventAmount = parseFloat(
            acceptedWithdrawalEvents[i].assetAmount
          )

          if (acceptedEventAmount <= 0 || acceptedAmount === requestedAmount)
            continue

          if (acceptedEventAmount > queuedAmount) {
            acceptedAmount += queuedAmount
          } else {
            acceptedAmount +=
              acceptedEventAmount > queuedAmount
                ? acceptedEventAmount - queuedAmount
                : acceptedEventAmount
          }

          acceptedWithdrawalEvents[i].assetAmount = (
            acceptedEventAmount - queuedAmount
          ).toString()

          lastAcceptedAmount = acceptedAmount - lastAcceptedAmount

          queuedAmount = requestedAmount - acceptedAmount
        }

        if (queuedAmount > 0) {
          pendingTransactions.push({
            id: withdrawalEvent.id,
            lendingPool: transaction.lendingPool,
            requestedAmount: queuedAmount.toString(),
            requestType: 'Withdrawal',
            trancheId: withdrawalEvent.trancheId,
            trancheName: withdrawalEvent.trancheName,
          })
        }
      }
      // Only process withdrawal requests because withdrawals may not be fully accepted yet
    } else {
      for (const unProcessedEvent of transaction.events) {
        pendingTransactions.push({
          id: unProcessedEvent.id,
          lendingPool: transaction.lendingPool,
          requestedAmount: unProcessedEvent.assetAmount,
          requestType:
            transaction.requestType === 'Deposit' ? 'Lending' : 'Withdrawal',
          trancheId: unProcessedEvent.trancheId,
          trancheName: unProcessedEvent.trancheName,
        })
      }
    }
  }

  return pendingTransactions
}
export default getPendingTransactionRequests
