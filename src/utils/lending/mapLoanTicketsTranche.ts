import { LoanTicketDto } from '@/config/api.lendersAgreement'
import groupBy from '@/utils/groupBy'

/**
 * @returns Loan Tickets grouped by tranche
 */
const mapLoanTicketsTranche = (loanTickets: LoanTicketDto[]) => {
  const ticketsGroupedByTranche = groupBy(
    loanTickets,
    ({ trancheID }) => trancheID
  )

  const trancheMap = new Map<string, LoanTicketDto[]>()

  for (const trancheTickets of Object.values(ticketsGroupedByTranche)) {
    const ticketsGroupedById = groupBy(trancheTickets, ({ id }) => id)

    const trancheId = trancheTickets[0].trancheID

    trancheMap.set(
      trancheId,
      Object.values(ticketsGroupedById).flatMap((tickets) => tickets)
    )
  }

  return trancheMap
}

export default mapLoanTicketsTranche
