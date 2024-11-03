import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'
import groupBy from '@/utils/groupBy'
import { LoanTicket } from '@/utils/lending/mapPendingDecisionsToPools'

const getPendingDecisions = (loanTicketGroups: LoanTicketDto[]) => {
  let ticketCount = 0

  const loanTickets: LoanTicket[] = []

  const groupedByEndBorrower = groupBy(
    loanTicketGroups,
    ({ endBorrowerID }) => endBorrowerID
  )

  for (const endBorrowerGroup of Object.values(groupedByEndBorrower)) {
    const groupedByID = groupBy(endBorrowerGroup, ({ id }) => id)

    let assets = 0
    let shares = 0
    let latestTicket: LoanTicketDto | undefined = undefined

    for (const group of Object.values(groupedByID)) {
      const sortedGroupedTickets = group.sort(
        (a, b) =>
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
      )

      const currentLatestTicket = sortedGroupedTickets[0]

      // only show tickets with latest event being emailSent
      if (currentLatestTicket.status !== LoanTicketStatus.emailSent) continue

      // find the created event for this emailSent group
      const createdEventTicket = sortedGroupedTickets.find(
        ({ status }) => status === LoanTicketStatus.created
      )

      // shouldn't happen because created and emailSent events are 1 - 1. Adding here just incase.
      if (!createdEventTicket) continue

      assets += parseFloat(createdEventTicket.assets)
      shares += parseFloat(createdEventTicket.shares)

      if (
        !latestTicket ||
        dayjs(latestTicket.createdOn).isBefore(
          dayjs(currentLatestTicket.createdOn)
        )
      ) {
        latestTicket = currentLatestTicket
      }
    }

    if (latestTicket) {
      ticketCount++

      loanTickets.push({
        id: endBorrowerGroup[0].id,
        endBorrowerID: endBorrowerGroup[0].endBorrowerID,
        createdOn: dayjs(latestTicket.createdOn).unix(),
        currentStatus: latestTicket.status,
        currentStatusDescription: latestTicket.statusDescription,
        poolID: latestTicket.poolID,
        trancheID: latestTicket.trancheID,
        userID: latestTicket.userID,
        events: endBorrowerGroup,
        assets,
        shares,
      })
    }
  }

  return { loanTickets, count: ticketCount }
}

export default getPendingDecisions
