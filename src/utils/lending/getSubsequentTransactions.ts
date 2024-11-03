import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'
import groupBy from '@/utils/groupBy'
import { LoanTicket } from '@/utils/lending/mapPendingDecisionsToPools'
import TimeConversions from '@/utils/timeConversions'

const getSubsequentTransactions = (loanTicketGroups: LoanTicketDto[]) => {
  const subsequentTransactions: LoanTicket[] = []

  const consentedTickets = loanTicketGroups.filter((ticket) =>
    [LoanTicketStatus.optedIn, LoanTicketStatus.optedOut].includes(
      ticket.status
    )
  )

  const groupedByDay = groupBy(consentedTickets, ({ createdOn }) =>
    (
      Math.round(
        (new Date(createdOn).getTime() / TimeConversions.SECONDS_PER_MINUTE) *
          1000
      ) *
      TimeConversions.SECONDS_PER_MINUTE *
      1000
    ).toString()
  )

  for (const dayGroup of Object.values(groupedByDay)) {
    const consentedGroup: LoanTicketDto[][] = []

    for (const consentedLoanTicket of dayGroup) {
      const consentedLoanTicketGroup = loanTicketGroups.filter(
        (ticket) => ticket.id === consentedLoanTicket.id
      )

      if (!consentedLoanTicketGroup) continue

      consentedGroup.push(consentedLoanTicketGroup)
    }

    const groupedByEndBorrower = groupBy(
      consentedGroup.flatMap((group) => group),
      ({ endBorrowerID }) => endBorrowerID
    )

    for (const endBorrowerGroup of Object.values(groupedByEndBorrower)) {
      let assets = 0
      let shares = 0

      for (const group of endBorrowerGroup) {
        assets += parseFloat(group.assets)
        shares += parseFloat(group.shares)
      }

      const lastConsentAction = endBorrowerGroup.findLast((ticket) =>
        [LoanTicketStatus.optedIn, LoanTicketStatus.optedOut].includes(
          ticket.status
        )
      )

      if (!lastConsentAction) continue

      subsequentTransactions.push({
        assets,
        shares,
        createdOn: dayjs(lastConsentAction.createdOn).unix(),
        poolID: lastConsentAction.poolID,
        endBorrowerID: lastConsentAction.endBorrowerID,
        trancheID: lastConsentAction.trancheID,
        userID: lastConsentAction.userID,
        currentStatus: lastConsentAction.status,
        currentStatusDescription: lastConsentAction.statusDescription,
        events: endBorrowerGroup,
        id: lastConsentAction.id, // can belong to mulitple but doesnt matter here since it won't be used elsewhere
      })
    }
  }

  return subsequentTransactions
}

export default getSubsequentTransactions
