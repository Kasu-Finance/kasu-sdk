import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import groupBy from '@/utils/groupBy'

export type CurrentDecisionStatus =
  | LoanTicketStatus.optedIn
  | LoanTicketStatus.optedOut
  | LoanTicketStatus.emailSent
  | undefined

const getCurrentDecisionStatus = (
  loanTickets: LoanTicketDto[],
  depositRequestID: string
): LoanTicketDto | undefined => {
  const groupedByDeposit = loanTickets.filter(
    (ticket) => ticket.depositRequestID === depositRequestID
  )

  const groupedByID = groupBy(groupedByDeposit, (ticket) => ticket.id)

  let latestTicket: LoanTicketDto | undefined

  for (const group of Object.values(groupedByID)) {
    const sortedGroup = group.sort(
      (a, b) =>
        new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
    )

    let tickets = sortedGroup

    const index = sortedGroup.findIndex((ticket) =>
      ['optedIn', 'optedOut'].includes(ticket.status)
    )

    if (index !== -1) {
      tickets = group.slice(0, index + 1)
    }

    if (!latestTicket) {
      latestTicket = tickets.reverse()[0]
    } else {
      const ticket = tickets.reverse()[0]

      if (
        new Date(ticket.createdOn).getTime() >
        new Date(latestTicket.createdOn).getTime()
      ) {
        latestTicket = ticket
      }
    }
  }

  switch (latestTicket?.status) {
    case LoanTicketStatus.optedIn:
    case LoanTicketStatus.optedOut:
    case LoanTicketStatus.emailSent:
      return latestTicket
    default:
      return undefined
  }
}

export default getCurrentDecisionStatus
