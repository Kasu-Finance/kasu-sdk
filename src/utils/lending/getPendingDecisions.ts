import {
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'

import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'
import groupBy from '@/utils/groupBy'
import mapLoanTicketsTranche from '@/utils/lending/mapLoanTicketsTranche'

export type PendingDecision = Omit<PoolOverview, 'tranches'> & {
  tranches: (TrancheData & { tickets: LoanTicket[] })[]
}

export type LoanTicket = {
  id: string
  endBorrowerID: string
  poolID: `0x${string}`
  trancheID: `0x${string}`
  userID: `0x${string}`
  assets: number
  shares: number
  currentStatus: LoanTicketStatus
  currentStatusDescription: string
  createdOn: EpochTimeStamp
  events: LoanTicketDto[]
  groupedIdEvents: LoanTicketDto[][]
}

const getPendingDecisions = (
  loanTickets: LoanTicketDto[],
  pools: PoolOverview[]
) => {
  let ticketCount = 0

  const trancheMap = mapLoanTicketsTranche(loanTickets)

  const pendingDecisions: PendingDecision[] = []

  for (const pool of pools) {
    const tranches: PendingDecision['tranches'] = []

    for (const tranche of pool.tranches) {
      const loanTicketGroups = trancheMap.get(tranche.id)

      if (!loanTicketGroups) continue

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

        const groupedIdEvents: LoanTicketDto[][] = []

        for (const group of Object.values(groupedByID)) {
          const sortedGroupedTickets = group.sort(
            (a, b) =>
              new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
          )

          const currentLatestTicket = sortedGroupedTickets[0]

          // only show tickets with latest event being emailSent
          if (currentLatestTicket.status !== LoanTicketStatus.emailSent)
            continue

          // find the created event for this emailSent group
          const createdEventTicket = sortedGroupedTickets.find(
            ({ status }) => status === LoanTicketStatus.created
          )

          // shouldn't happen because created and emailSent events are 1 - 1. Adding here just incase.
          if (!createdEventTicket) continue

          groupedIdEvents.push(sortedGroupedTickets)

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
            groupedIdEvents,
            assets,
            shares,
          })
        }
      }

      if (!loanTickets.length) continue

      tranches.push({ ...tranche, tickets: loanTickets })
    }

    if (!tranches.length) continue

    pendingDecisions.push({ ...pool, tranches })
  }

  return {
    pendingDecisions,
    count: ticketCount,
  }
}

export default getPendingDecisions
