import {
  UserRequest,
  UserRequestEvent,
} from '@solidant/kasu-sdk/src/services/UserLending/types'

import { LoanTicketDto } from '@/config/api.lendersAgreement'
import getPendingDecisions from '@/utils/lending/getPendingDecisions'
import getSubsequentTransactions from '@/utils/lending/getSubsequentTransactions'
import mapLoanTicketsTranche from '@/utils/lending/mapLoanTicketsTranche'
import { LoanTicket } from '@/utils/lending/mapPendingDecisionsToPools'

type DetailedTransactionBase = {
  id: string
  userId: string
  lendingPool: {
    id: string
    name: string
    tranches: { orderId: string }[]
  }
  trancheName: string
  trancheId: string
  timestamp: EpochTimeStamp
  pendingDecisions: LoanTicket[]
  subsequentTransactions: LoanTicket[]
  events: UserRequestEvent[]
  latestEventStatus: UserRequestEvent['requestType']
}

type CancellableRequest<T> = T & {
  canCancel: boolean
  nftId: string
}

type DetailTransactionDepositRequest = {
  requestType: 'Deposit'
  requestedAmount: string
  acceptedAmount: string
  rejectedAmount: string
  reallocatedOutAmount: string
  canCancel: boolean
  nftId: string
}

type DetailTransactionWithdrawalRequest = {
  requestType: 'Withdrawal'
  requestedAmount: string
  acceptedAmount: string
  queuedAmount: string
}

type DetailedTransactionReallocationRequest = {
  requestType: 'Reallocation'
  reallocatedInAmount: string
}

export type DetailedTransaction = DetailedTransactionBase &
  (
    | CancellableRequest<DetailTransactionDepositRequest>
    | CancellableRequest<DetailTransactionWithdrawalRequest>
    | DetailedTransactionReallocationRequest
  )

const getDetailedTransactions = (
  transactionHistory: UserRequest[],
  loanTickets: LoanTicketDto[]
) => {
  const detailedTransactions: DetailedTransaction[] = []

  const trancheMap = mapLoanTicketsTranche(loanTickets)

  for (const transaction of transactionHistory) {
    const transactions: DetailedTransaction[] = []

    const detailedTransactionBase: DetailedTransactionBase = {
      id: transaction.id,
      lendingPool: transaction.lendingPool,
      timestamp: transaction.timestamp,
      trancheName: transaction.trancheName,
      trancheId: transaction.trancheId,
      userId: transaction.userId,
      pendingDecisions: [],
      subsequentTransactions: [],
      events: transaction.events,
      latestEventStatus: transaction.events.sort(
        (a, b) => b.timestamp - a.timestamp
      )[0].requestType,
    }

    let detailedTransaction: DetailedTransaction | undefined = undefined

    if (transaction.requestType === 'Deposit') {
      detailedTransaction = {
        ...detailedTransactionBase,
        requestType: transaction.requestType,
        requestedAmount: transaction.requestedAmount,
        acceptedAmount: transaction.acceptedAmount,
        rejectedAmount: transaction.rejectedAmount,
        reallocatedOutAmount: '0',
        canCancel: transaction.canCancel,
        nftId: transaction.nftId,
      }
    } else {
      detailedTransaction = {
        ...detailedTransactionBase,
        requestType: transaction.requestType,
        requestedAmount: transaction.requestedAmount,
        acceptedAmount: transaction.acceptedAmount,
        queuedAmount:
          // only calculate and show queued if theres any been accepted
          parseFloat(transaction.acceptedAmount) > 0
            ? (
                parseFloat(transaction.requestedAmount) -
                parseFloat(transaction.acceptedAmount)
              ).toString()
            : '0',
        canCancel: transaction.canCancel,
        nftId: transaction.nftId,
      }
    }

    const loanTicketGroups = trancheMap.get(transaction.trancheId.toLowerCase())

    if (loanTicketGroups) {
      const { loanTickets } = getPendingDecisions(loanTicketGroups)

      detailedTransaction.pendingDecisions = loanTickets

      const subsequentTransactions = getSubsequentTransactions(loanTicketGroups)

      detailedTransaction.subsequentTransactions = [
        ...subsequentTransactions,
        ...loanTickets, // add pending decisions to last
      ].sort((a, b) => a.createdOn - b.createdOn)
    }

    for (const event of transaction.events) {
      if (
        event.requestType !== 'Reallocated' ||
        detailedTransaction.requestType !== 'Deposit'
      )
        continue

      detailedTransaction.acceptedAmount = (
        parseFloat(detailedTransaction.acceptedAmount) -
        parseFloat(event.totalAccepted)
      ).toString()

      detailedTransaction.reallocatedOutAmount = (
        parseFloat(detailedTransaction.reallocatedOutAmount) +
        parseFloat(event.totalAccepted)
      ).toString()

      transactions.push({
        ...detailedTransactionBase,
        requestType: 'Reallocation',
        reallocatedInAmount: event.totalAccepted,
        trancheName: event.trancheName,
        trancheId: event.trancheId,
      })
    }

    transactions.unshift(detailedTransaction)

    detailedTransactions.push(...transactions)
  }

  return detailedTransactions
}

export default getDetailedTransactions
