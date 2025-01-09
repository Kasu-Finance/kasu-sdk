import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'
import groupBy from '@/utils/groupBy'

export type SubsequentTransaction = {
  amount: number
  action: string
  status: 'completed' | 'pending'
  depositRequestID: string
  timestamp: EpochTimeStamp
  id: string
  trancheID: string
  poolID: string
  userID: string
  epochID: string
  endBorrowerID: string
}

const getSubsequentTransactions = (loanTickets: LoanTicketDto[]) => {
  const groupedByDeposit = groupBy(
    loanTickets,
    (ticket) => ticket.depositRequestID
  )

  const depositGroupMap = new Map<string, SubsequentTransaction[]>()

  for (const depositGroup of Object.values(groupedByDeposit)) {
    const groupedByID = groupBy(depositGroup, (ticket) => ticket.id)

    const ticketGroup = Object.values(groupedByID)

    for (const group of ticketGroup) {
      const groupID = group[0].depositRequestID

      const validGroups = group.filter((ticket) =>
        [LoanTicketStatus.created, LoanTicketStatus.emailSent].includes(
          ticket.status
        )
      )

      // If the group does not have 2 tickets with status created and emailSent, skip
      if (validGroups.length !== 2) continue

      const sortedGroup = group.sort(
        (a, b) =>
          new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
      )

      let tickets = sortedGroup

      const index = sortedGroup.findLastIndex((ticket) =>
        [
          LoanTicketStatus.optedIn,
          LoanTicketStatus.optedOut,
          LoanTicketStatus.fundsReturned,
        ].includes(ticket.status)
      )

      if (index !== -1) {
        tickets = sortedGroup.slice(0, index + 1)
      }

      const amount = tickets.reduce((acc, ticket) => {
        if (ticket.status === LoanTicketStatus.fundsReturned) return acc

        return acc + parseFloat(ticket.assets)
      }, 0)

      if (amount <= 0) continue

      const subsequentTransactions: SubsequentTransaction[] = []

      for (const ticket of tickets) {
        if (ticket.status === 'created') continue

        subsequentTransactions.push({
          amount,
          action: ticket.status,
          status: index !== -1 ? 'completed' : 'pending',
          depositRequestID: groupID,
          timestamp: dayjs(ticket.createdOn).unix(),
          id: ticket.id,
          trancheID: ticket.trancheID,
          poolID: ticket.poolID,
          userID: ticket.userID,
          epochID: ticket.epochID,
          endBorrowerID: ticket.endBorrowerID,
        })
      }

      const existingTickets = depositGroupMap.get(groupID)

      depositGroupMap.set(groupID, [
        ...(existingTickets ?? []),
        ...subsequentTransactions,
      ])
    }
  }

  return depositGroupMap
}

export default getSubsequentTransactions
