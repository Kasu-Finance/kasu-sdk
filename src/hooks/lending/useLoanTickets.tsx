import useSWR from 'swr'
import { useAccount, useChainId } from 'wagmi'

import { LoanTicketDto, LoanTicketDtoRaw } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'

const useLoanTickets = () => {
  const account = useAccount()

  const chainId = useChainId()

  const { data, error, isLoading, mutate } = useSWR(
    account.address && chainId
      ? ['loanTickets', account.address, chainId]
      : null,
    async ([_, userAddress, chainId]): Promise<LoanTicketDto[]> => {
      const res = await fetch(
        '/api/loan-tickets?' +
          new URLSearchParams({
            chainId: chainId.toString(),
            userAddress: userAddress.toLowerCase(),
          })
      )

      const data: LoanTicketDtoRaw[] = await res.json()

      return data.map((data) => ({
        ...data,
        dailyGroupID: dayjs(data.createdOn).startOf('day').toISOString(),
      }))
    }
  )

  return {
    loanTickets: data,
    error,
    isLoading,
    updateLoanTickets: mutate,
  }
}

export default useLoanTickets
