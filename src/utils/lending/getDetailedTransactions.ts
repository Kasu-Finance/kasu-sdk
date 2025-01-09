import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

import { LoanTicketDto } from '@/config/api.lendersAgreement'
import getCurrentDecisionStatus from '@/utils/lending/getCurrentDecisionStatus'
import getPendingDecisions from '@/utils/lending/getPendingDecisions'
import getSubsequentTransactions, {
  SubsequentTransaction,
} from '@/utils/lending/getSubsequentTransactions'
import mapLoanTicketsTranche from '@/utils/lending/mapLoanTicketsTranche'
import { LoanTicket } from '@/utils/lending/mapPendingDecisionsToPools'

type DepositTransaction = {
  requestType: 'Deposit'
}

export type DetailedTransactionBase = {
  id: string
  userId: string
  lendingPool: {
    id: string
    name: string
    tranches: { orderId: string }[]
  }
  trancheName: string
  trancheId: string
  apy: string
  fixedTermConfig: UserRequest['fixedTermConfig']
  nftId: string
  requestedAmount: string
  requestTimestamp: EpochTimeStamp
  epochId: string
  transactionHash: string
}

export type UnprocessedTransaction<T> = T & {
  requestStatus: 'Requested'
  canCancel: boolean
}

export type CancelledTransaction<T> = T & {
  requestStatus: 'Cancelled'
  cancelledTimestamp: EpochTimeStamp
}

export type ProcessedTransaction<T> = T & {
  requestStatus: 'Processed'
  processedTimestamp: EpochTimeStamp
}

export type DetailTransactionDepositRequest = {
  requestType: 'Deposit'
  acceptedAmount: string
  rejectedAmount: string
  reallocatedOutAmount: string
}

export type DetailedTransactionReallocationRequest = Omit<
  DetailedTransactionBase,
  'requestedAmount' | 'nftId'
> & {
  requestType: 'Reallocation'
  reallocatedInAmount: string
  acceptedAmount: string
  rejectedAmount: string
  reallocatedOutAmount: string
  fixedTermConfig: undefined
  subsequentTransactions: SubsequentTransaction[]
  pendingDecisions: LoanTicket[]
  currentDecisionStatus: LoanTicketDto | undefined
}

export type DetailedTransaction = DetailedTransactionBase &
  (
    | UnprocessedTransaction<DepositTransaction>
    | CancelledTransaction<DepositTransaction>
    | ProcessedTransaction<DetailTransactionDepositRequest>
  )

export type DetailedTransactionWrapper = {
  type: 'Deposit'
  poolId: string
  poolName: string
  fixedTermConfig: UserRequest['fixedTermConfig']
  trancheName: string
  trancheId: string
  currentDecisionStatus: LoanTicketDto | undefined
  pendingDecisions: LoanTicket[]
  subsequentTransactions: SubsequentTransaction[]
  transactions: DetailedTransaction[]
  lastTransactionDate: EpochTimeStamp
  events: {
    trancheName: string
    epochId: string
    timestamp: EpochTimeStamp
    amount: string
    status: DetailedTransaction['requestStatus']
    type: 'Request' | 'Accepted' | 'Rejected' | 'Reallocated'
    transactionHash: string
  }[]
  reallocationEvents: DetailedTransactionReallocationRequest[]
}

const getDetailedTransactions = (
  transactionHistory: UserRequest[],
  loanTickets: LoanTicketDto[]
) => {
  const detailedTransactions: DetailedTransactionWrapper[] = []

  const trancheMap = mapLoanTicketsTranche(loanTickets)

  const pendingDecisionMap = new Map<string, LoanTicket[]>()

  for (const [trancheId, loanTicketGroups] of trancheMap.entries()) {
    const { loanTickets } = getPendingDecisions(loanTicketGroups)

    pendingDecisionMap.set(trancheId, loanTickets)
  }

  const subsequentTransactionsMap = getSubsequentTransactions(loanTickets)

  for (const transaction of transactionHistory) {
    if (transaction.requestType === 'Withdrawal') continue

    const reallocationEvents: DetailedTransactionReallocationRequest[] = []

    let transactionActionId: string | undefined

    const depositGroup: DetailedTransaction[] = []

    const isProcessed = transaction.events.find(
      (event) =>
        event.requestType !== 'Initiated' && event.requestType !== 'Increased'
    )

    if (!isProcessed) {
      for (const unProcessedEvent of transaction.events) {
        transactionActionId = unProcessedEvent.id

        depositGroup.push({
          id: unProcessedEvent.id,
          lendingPool: transaction.lendingPool,
          requestTimestamp: unProcessedEvent.timestamp,
          trancheName: unProcessedEvent.trancheName,
          trancheId: unProcessedEvent.trancheId,
          userId: transaction.userId,
          apy: unProcessedEvent.apy,
          fixedTermConfig: transaction.fixedTermConfig,
          nftId: transaction.nftId,
          requestedAmount: unProcessedEvent.assetAmount,
          requestType: 'Deposit',
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
        transactionActionId = cancelledEvent.id

        depositGroup.push({
          id: cancelledEvent.id,
          lendingPool: transaction.lendingPool,
          requestTimestamp: transaction.timestamp,
          trancheName: cancelledEvent.trancheName,
          trancheId: cancelledEvent.trancheId,
          userId: transaction.userId,
          apy: cancelledEvent.apy,
          fixedTermConfig: transaction.fixedTermConfig,
          requestType: 'Deposit',
          requestStatus: 'Cancelled',
          requestedAmount: cancelledEvent.assetAmount,
          nftId: transaction.nftId,
          cancelledTimestamp: cancelledEvent.timestamp,
          epochId: cancelledEvent.epochId,
          transactionHash: cancelledEvent.transactionHash,
        })
      } else {
        const data = transaction.events.reduce(
          (acc, cur) => {
            if (
              ['Cancelled', 'Initiated', 'Increased'].includes(cur.requestType)
            )
              return acc

            acc.processedTimestamp = cur.timestamp

            const amount = parseFloat(cur.assetAmount)

            switch (cur.requestType) {
              case 'Accepted':
                acc.totalAcceptedAmount += amount
                acc.acceptedEventId = cur.id
                acc.acceptedTxHash = cur.transactionHash
                break
              case 'Rejected':
                acc.totalRejectedAmount += amount
                acc.rejectedEventId = cur.id
                break
              case 'Reallocated':
                acc.totalReallocatedAmount[cur.trancheId] = amount
                break
            }

            return acc
          },
          {
            acceptedTxHash: '',
            acceptedEventId: '',
            rejectedEventId: '',
            processedTimestamp: transaction.timestamp,
            totalAcceptedAmount: 0,
            totalRejectedAmount: 0,
            totalReallocatedAmount: {} as Record<string, number>,
          }
        )

        let { totalAcceptedAmount, totalRejectedAmount } = data

        const {
          processedTimestamp,
          totalReallocatedAmount,
          acceptedEventId,
          rejectedEventId,
          acceptedTxHash,
        } = data

        transactionActionId = acceptedEventId

        const initialDepositEvents = transaction.events.filter(
          (event) =>
            event.requestType === 'Initiated' ||
            event.requestType === 'Increased'
        )

        for (const depositEvent of initialDepositEvents) {
          const requestedAmount = parseFloat(depositEvent.assetAmount)

          let rejectedAmount = 0
          let reallocatedOutAmount = 0
          let acceptedAmount = totalAcceptedAmount > 0 ? requestedAmount : 0

          // handle accepted deposits first
          if (
            totalAcceptedAmount > 0 &&
            totalAcceptedAmount < requestedAmount
          ) {
            acceptedAmount = totalAcceptedAmount
          }

          totalAcceptedAmount -= acceptedAmount

          const totalReallocationValue = Object.values(
            totalReallocatedAmount
          ).reduce((total, cur) => total + cur, 0)

          if (totalReallocationValue > 0) {
            reallocatedOutAmount = requestedAmount - acceptedAmount
          }

          if (totalRejectedAmount > 0 && acceptedAmount !== requestedAmount) {
            transactionActionId = rejectedEventId

            let remainingRejectedAmount = 0

            if (
              totalReallocationValue > 0 &&
              totalRejectedAmount > totalReallocationValue
            ) {
              remainingRejectedAmount =
                totalRejectedAmount - totalReallocationValue
            }

            const unacceptedAmount =
              requestedAmount - acceptedAmount - remainingRejectedAmount

            rejectedAmount = unacceptedAmount
            totalRejectedAmount -= rejectedAmount
          }

          depositGroup.push({
            id: depositEvent.id,
            lendingPool: transaction.lendingPool,
            requestTimestamp: depositEvent.timestamp,
            trancheName: depositEvent.trancheName,
            trancheId: depositEvent.trancheId,
            userId: transaction.userId,
            apy: depositEvent.apy,
            fixedTermConfig: transaction.fixedTermConfig,
            nftId: transaction.nftId,
            requestType: 'Deposit',
            requestStatus: 'Processed',
            requestedAmount: requestedAmount.toString(),
            acceptedAmount: Math.max(0, acceptedAmount).toString(),
            rejectedAmount: rejectedAmount.toString(),
            reallocatedOutAmount: reallocatedOutAmount.toString(),
            processedTimestamp,
            epochId: depositEvent.epochId,
            transactionHash: acceptedTxHash,
          })
        }
      }
    }

    const { totalRequestedAmount, totalAcceptedAmount, totalRejectedAmount } =
      transaction.events.reduce(
        (acc, cur) => {
          if (
            ['Cancelled', 'Rejected', 'Reallocated'].includes(cur.requestType)
          )
            return acc

          const amount = parseFloat(cur.assetAmount)

          switch (cur.requestType) {
            case 'Initiated':
            case 'Increased':
              acc.totalRequestedAmount += amount
              break
            case 'Accepted':
              acc.totalAcceptedAmount += amount
              break
            case 'Rejected':
              acc.totalRejectedAmount += amount
              break
          }

          return acc
        },
        {
          totalRequestedAmount: 0,
          totalAcceptedAmount: 0,
          totalRejectedAmount: 0,
        }
      )

    let reallocatedOutAmount = totalRequestedAmount - totalAcceptedAmount
    let rejectedAmount = 0

    for (const event of transaction.events) {
      if (event.requestType !== 'Reallocated') continue

      if (
        reallocatedOutAmount - parseFloat(event.totalAccepted) ===
        totalRejectedAmount
      ) {
        rejectedAmount = totalRejectedAmount
      }

      reallocationEvents.push({
        id: event.id,
        lendingPool: transaction.lendingPool,
        requestTimestamp: event.timestamp,
        trancheName: event.trancheName,
        trancheId: event.trancheId,
        userId: transaction.userId,
        apy: event.apy,
        fixedTermConfig: undefined, // reallocations will never have fixed term config
        requestType: 'Reallocation',
        reallocatedInAmount: reallocatedOutAmount.toString(),
        acceptedAmount: event.totalAccepted,
        rejectedAmount: rejectedAmount.toString(),
        reallocatedOutAmount: (
          reallocatedOutAmount - parseFloat(event.totalAccepted)
        ).toString(),
        subsequentTransactions:
          subsequentTransactionsMap
            .get(event.id)
            ?.sort((a, b) => b.timestamp - a.timestamp) ?? [],
        pendingDecisions: pendingDecisionMap.get(event.trancheId) ?? [],
        currentDecisionStatus: getCurrentDecisionStatus(loanTickets, event.id),
        epochId: event.epochId,
        transactionHash: event.transactionHash,
      })

      reallocatedOutAmount -= parseFloat(event.totalAccepted)
    }

    const requestedEvents: DetailedTransactionWrapper['events'] =
      depositGroup.map((deposit) => ({
        epochId: deposit.epochId,
        timestamp: deposit.requestTimestamp,
        amount: deposit.requestedAmount,
        status: deposit.requestStatus,
        transactionHash: deposit.transactionHash,
        type: 'Request',
        trancheName: deposit.trancheName,
      }))

    const processedEvents: DetailedTransactionWrapper['events'] =
      transaction.events
        .filter((event) => ['Accepted', 'Rejected'].includes(event.requestType))
        .map((event) => ({
          epochId: event.epochId,
          timestamp: event.timestamp,
          amount:
            event.requestType === 'Accepted'
              ? event.totalAccepted
              : event.totalRejected,
          status: 'Processed',
          transactionHash: event.transactionHash,
          type: event.requestType as 'Accepted' | 'Rejected',
          trancheName: event.trancheName,
        }))

    const processedReallocations: DetailedTransactionWrapper['events'] = []

    if (reallocationEvents.length) {
      const totalRequested = requestedEvents.reduce(
        (acc, cur) => acc + parseFloat(cur.amount),
        0
      )

      const totalAcceptedAndRejected = processedEvents.reduce(
        (acc, cur) => acc + parseFloat(cur.amount),
        0
      )

      processedReallocations.push({
        epochId: reallocationEvents[0].epochId,
        status: 'Processed',
        timestamp: reallocationEvents[0].requestTimestamp,
        trancheName: transaction.trancheName,
        amount: (totalRequested - totalAcceptedAndRejected).toString(),
        transactionHash: reallocationEvents[0].transactionHash,
        type: 'Reallocated',
      })
    }

    detailedTransactions.push({
      type: 'Deposit',
      poolName: transaction.lendingPool.name,
      poolId: transaction.lendingPool.id,
      trancheName: transaction.trancheName,
      currentDecisionStatus: transactionActionId
        ? getCurrentDecisionStatus(loanTickets, transactionActionId)
        : undefined,
      pendingDecisions: transactionActionId
        ? pendingDecisionMap.get(transaction.trancheId) ?? []
        : [],
      subsequentTransactions: transactionActionId
        ? subsequentTransactionsMap
            .get(transactionActionId)
            ?.sort((a, b) => b.timestamp - a.timestamp) ?? []
        : [],
      lastTransactionDate: [...transaction.events].reverse()[0].timestamp,
      transactions: depositGroup,
      events: [
        ...requestedEvents,
        ...processedEvents,
        ...processedReallocations,
      ],
      reallocationEvents,
      fixedTermConfig: transaction.fixedTermConfig,
      trancheId: transaction.trancheId,
    })
  }

  return detailedTransactions
}

export default getDetailedTransactions
