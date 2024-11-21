import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import groupBy from '@/utils/groupBy'

type Amounts = {
  pendingDecisionAmount: number
  optedInAmount: number
  optedOutAmount: number
  fundsReturnedAmount: number
}

const initialState: Amounts = {
  pendingDecisionAmount: 0,
  optedInAmount: 0,
  optedOutAmount: 0,
  fundsReturnedAmount: 0,
}

const getAmountKey = (status: LoanTicketStatus): keyof Amounts => {
  switch (status) {
    case LoanTicketStatus.optedOut:
      return 'optedOutAmount'
    case LoanTicketStatus.optedIn:
      return 'optedInAmount'
    case LoanTicketStatus.fundsReturned:
      return 'fundsReturnedAmount'
    default:
      return 'pendingDecisionAmount'
  }
}

const calculateSubsequentTransactionSummary = (
  loanTickets: LoanTicketDto[],
  currentEpoch: string
) => {
  const groupedByID = groupBy(loanTickets, ({ id }) => id)

  const currentEpochAmounts: Amounts = { ...initialState }
  const lifetimeAmounts: Amounts = { ...initialState }

  for (const group of Object.values(groupedByID)) {
    // handle funds returned separately
    const hasFundsReturned = group.find(
      ({ status }) => status === LoanTicketStatus.fundsReturned
    )

    if (hasFundsReturned) {
      lifetimeAmounts.fundsReturnedAmount += parseFloat(hasFundsReturned.assets)

      if (
        parseFloat(hasFundsReturned.epochID) ===
        parseFloat(currentEpoch) - 1
      ) {
        currentEpochAmounts.fundsReturnedAmount += parseFloat(
          hasFundsReturned.assets
        )
      }
    }

    // remove funds returned and check latest events
    const sortedGroupedTickets = group
      .filter(({ status }) => status !== LoanTicketStatus.fundsReturned)
      .sort(
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

    const totalAssets = sortedGroupedTickets.reduce(
      (total, cur) => total + parseFloat(cur.assets),
      0
    )

    const amountKey: keyof Amounts = getAmountKey(currentLatestTicket.status)

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
