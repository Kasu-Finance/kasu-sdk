import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import groupBy from '@/utils/groupBy'

type Amounts = {
  pendingDecisionAmount: number
  optedInAmount: number
  optedOutAmount: number
}

const initialState: Amounts = {
  pendingDecisionAmount: 0,
  optedInAmount: 0,
  optedOutAmount: 0,
}

const calculateSubsequentTransactionSummary = (
  loanTickets: LoanTicketDto[],
  currentEpoch: string
) => {
  const groupedByID = groupBy(loanTickets, ({ id }) => id)

  const currentEpochAmounts: Amounts = { ...initialState }
  const lifetimeAmounts: Amounts = { ...initialState }

  for (const group of Object.values(groupedByID)) {
    const sortedGroupedTickets = group.sort(
      (a, b) =>
        new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
    )

    const currentLatestTicket = sortedGroupedTickets[0]

    if (
      ![
        LoanTicketStatus.optedIn,
        LoanTicketStatus.optedOut,
        LoanTicketStatus.emailSent,
      ].includes(currentLatestTicket.status)
    )
      continue

    const totalAssets = sortedGroupedTickets.reduce((total, cur) => {
      if (cur.status === LoanTicketStatus.optedOut) return total

      return total + parseFloat(cur.assets)
    }, 0)

    const amountKey: keyof Amounts =
      currentLatestTicket.status === LoanTicketStatus.optedIn
        ? 'optedInAmount'
        : currentLatestTicket.status === LoanTicketStatus.optedOut
          ? 'optedOutAmount'
          : 'pendingDecisionAmount'

    lifetimeAmounts[amountKey] += totalAssets

    if (
      parseFloat(currentLatestTicket.epochID) ===
      parseFloat(currentEpoch) - 1
    ) {
      currentEpochAmounts[amountKey] += totalAssets
    }
  }

  return { currentEpochAmounts, lifetimeAmounts }
}

export default calculateSubsequentTransactionSummary
