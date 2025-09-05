import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

type WithdrawalTransactionBase = {
  id: string
  userId: string
  lendingPool: {
    id: string
    name: string
    tranches: { orderId: string }[]
  }
  nftId: string
  trancheName: string
  trancheId: string
  apy: string
  fixedTermConfig: UserRequest['fixedTermConfig']
  requestTimestamp: EpochTimeStamp
  epochId: string
  transactionHash: string
  requestedAmount: string
}

type UnprocessedTransaction<T> = T & {
  requestStatus: 'Requested'
  canCancel: boolean
}

type CancelledWithdrawalTransaction<T> = T & {
  requestStatus: 'Cancelled'
  cancelledTimestamp: EpochTimeStamp
}

type ProcessedWithdrawalTransaction<T> = T & {
  requestStatus: 'Processed'
  acceptedAmount: string
  queuedAmount: string
  remainingAmount: string
  lastAcceptedAmount: string
}

type ForcedWithdrawalTransaction<T> = T & {
  requestStatus: 'Forced'
  acceptedAmount: string
}

export type WithdrawalTransaction =
  | ProcessedWithdrawalTransaction<WithdrawalTransactionBase>
  | CancelledWithdrawalTransaction<WithdrawalTransactionBase>
  | UnprocessedTransaction<WithdrawalTransactionBase>
  | ForcedWithdrawalTransaction<WithdrawalTransactionBase>

export type WithdrawalTransactionWrapper = {
  type: 'Withdrawal'
  poolId: string
  poolName: string
  fixedTermConfig: UserRequest['fixedTermConfig']
  trancheName: string
  trancheId: string
  lastTransactionDate: EpochTimeStamp
  transactions: WithdrawalTransaction[]
  events: {
    trancheName: string
    epochId: string
    timestamp: EpochTimeStamp
    amount: string
    remainingQueuedAmount: string
    status: WithdrawalTransaction['requestStatus']
    transactionHash: string
  }[]
}

const getWithdrawalTransactions = (transactionHistory: UserRequest[]) => {
  const withdrawalTransactions: WithdrawalTransactionWrapper[] = []

  for (const transaction of transactionHistory) {
    if (transaction.requestType === 'Deposit') continue

    const withdrawalGroup: WithdrawalTransaction[] = []

    const isForced = transaction.events.find(
      (event) => event.requestType === 'Forced'
    )

    const isProcessed = transaction.events.find(
      (event) =>
        event.requestType !== 'Initiated' && event.requestType !== 'Increased'
    )

    if (isForced) {
      for (const forcedEvent of transaction.events) {
        withdrawalGroup.push({
          id: forcedEvent.id,
          lendingPool: transaction.lendingPool,
          requestTimestamp: forcedEvent.timestamp,
          trancheName: forcedEvent.trancheName,
          trancheId: forcedEvent.trancheId,
          userId: transaction.userId,
          nftId: transaction.nftId,
          apy: forcedEvent.apy,
          fixedTermConfig: transaction.fixedTermConfig,
          requestedAmount: forcedEvent.assetAmount,
          requestStatus: 'Forced',
          acceptedAmount: forcedEvent.assetAmount,
          epochId: forcedEvent.epochId,
          transactionHash: forcedEvent.transactionHash,
        })
      }
    } else if (!isProcessed) {
      for (const unProcessedEvent of transaction.events) {
        withdrawalGroup.push({
          id: unProcessedEvent.id,
          lendingPool: transaction.lendingPool,
          requestTimestamp: unProcessedEvent.timestamp,
          trancheName: unProcessedEvent.trancheName,
          trancheId: unProcessedEvent.trancheId,
          userId: transaction.userId,
          nftId: transaction.nftId,
          apy: unProcessedEvent.apy,
          fixedTermConfig: transaction.fixedTermConfig,
          requestedAmount: unProcessedEvent.assetAmount,
          requestStatus: 'Requested',
          canCancel: transaction.canCancel,
          epochId: unProcessedEvent.epochId,
          transactionHash: unProcessedEvent.transactionHash,
        })
      }
    } else {
      const cancelledEvent = transaction.events.find(
        (event) => event.requestType === 'Cancelled'
      )

      if (cancelledEvent) {
        withdrawalGroup.push({
          id: cancelledEvent.id,
          lendingPool: transaction.lendingPool,
          requestTimestamp: transaction.timestamp,
          trancheName: cancelledEvent.trancheName,
          trancheId: cancelledEvent.trancheId,
          userId: transaction.userId,
          nftId: transaction.nftId,
          apy: cancelledEvent.apy,
          fixedTermConfig: transaction.fixedTermConfig,
          requestStatus: 'Cancelled',
          requestedAmount: cancelledEvent.assetAmount,
          cancelledTimestamp: cancelledEvent.timestamp,
          epochId: cancelledEvent.epochId,
          transactionHash: cancelledEvent.transactionHash,
        })
      } else {
        const totalRequestedAmount = transaction.events.reduce(
          (acc, cur) =>
            ['Initiated', 'Increased'].includes(cur.requestType)
              ? acc + parseFloat(cur.assetAmount)
              : acc,
          0
        )

        const totalAcceptedAmount = transaction.events.reduce(
          (acc, cur) =>
            cur.requestType !== 'Accepted'
              ? acc
              : (acc += parseFloat(cur.assetAmount)),

          0
        )

        const initialWithdrawalEvents = transaction.events.filter(
          (event) =>
            event.requestType === 'Initiated' ||
            event.requestType === 'Increased'
        )

        // parsing to prevent original array from being mutate later
        // https://stackoverflow.com/questions/66845607/array-is-getting-mutated-even-after-using-spread-operator
        const acceptedWithdrawalEvents = JSON.parse(
          JSON.stringify(
            transaction.events.filter(
              (event) => event.requestType === 'Accepted'
            )
          )
        )

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

          withdrawalGroup.push({
            id: withdrawalEvent.id,
            lendingPool: transaction.lendingPool,
            requestTimestamp: withdrawalEvent.timestamp,
            trancheName: withdrawalEvent.trancheName,
            trancheId: withdrawalEvent.trancheId,
            userId: transaction.userId,
            nftId: transaction.nftId,
            apy: withdrawalEvent.apy,
            fixedTermConfig: transaction.fixedTermConfig,
            requestStatus: 'Processed',
            requestedAmount: requestedAmount.toString(),
            acceptedAmount: acceptedAmount.toString(),
            queuedAmount: queuedAmount.toString(),
            remainingAmount: (
              totalRequestedAmount - totalAcceptedAmount
            ).toString(),
            epochId: withdrawalEvent.epochId,
            transactionHash: withdrawalEvent.transactionHash,
            lastAcceptedAmount: lastAcceptedAmount.toString(),
          })
        }
      }
    }

    const withdrawalEvents: WithdrawalTransactionWrapper['events'] = []

    const totalRequestedAmount = transaction.events.reduce(
      (acc, cur) =>
        ['Initiated', 'Increased'].includes(cur.requestType)
          ? acc + parseFloat(cur.assetAmount)
          : acc,
      0
    )

    let acceptedAmount = 0

    for (const event of transaction.events.sort(
      (a, b) => a.timestamp - b.timestamp
    )) {
      let remainingQueuedAmount = event.assetAmount

      if (event.requestType === 'Accepted') {
        acceptedAmount += parseFloat(event.assetAmount)

        remainingQueuedAmount = (
          totalRequestedAmount - acceptedAmount
        ).toString()
      }

      withdrawalEvents.push({
        epochId: event.epochId,
        amount: event.assetAmount,
        remainingQueuedAmount,
        status: ['Initiated', 'Increased'].includes(event.requestType)
          ? 'Requested'
          : event.requestType === 'Forced'
            ? 'Forced'
            : 'Processed',
        timestamp: event.timestamp,
        trancheName: event.trancheName,
        transactionHash: event.transactionHash,
      })
    }

    withdrawalTransactions.push({
      type: 'Withdrawal',
      poolId: transaction.lendingPool.id,
      poolName: transaction.lendingPool.name,
      fixedTermConfig: transaction.fixedTermConfig,
      trancheId: transaction.trancheId,
      trancheName: transaction.trancheName,
      lastTransactionDate: [...transaction.events].reverse()[0].timestamp,
      transactions: withdrawalGroup,
      events: withdrawalEvents,
    })
  }

  return withdrawalTransactions
}

export default getWithdrawalTransactions
