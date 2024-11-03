import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import getPendingDecisions from '@/utils/lending/getPendingDecisions'
import mapLoanTicketsTranche from '@/utils/lending/mapLoanTicketsTranche'

export type PendingDecisionPool = {
  poolName: string
  id: string
  tranches: {
    id: string
    name: string
  }[]
}

export type PendingDecision = Omit<PendingDecisionPool, 'tranches'> & {
  tranches: (PendingDecisionPool['tranches'][number] & {
    tickets: LoanTicket[]
  })[]
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
}

const mapPendingDecisionsToPools = (
  loanTickets: LoanTicketDto[],
  pools: PendingDecisionPool[]
) => {
  let ticketCount = 0

  const trancheMap = mapLoanTicketsTranche(loanTickets)

  const pendingDecisions: PendingDecision[] = []

  for (const pool of pools) {
    const tranches: PendingDecision['tranches'] = []

    for (const tranche of pool.tranches) {
      const loanTicketGroups = trancheMap.get(tranche.id)

      if (!loanTicketGroups) continue

      const { loanTickets, count } = getPendingDecisions(loanTicketGroups)

      ticketCount += count

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

export default mapPendingDecisionsToPools
