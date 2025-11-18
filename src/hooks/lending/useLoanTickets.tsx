import useSWR from 'swr'
import { useChainId } from 'wagmi'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { LoanTicketDto, LoanTicketDtoRaw } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'

const useLoanTickets = () => {
  const { address } = usePrivyAuthenticated()

  const chainId = useChainId()

  const { data, error, isLoading, mutate } = useSWR(
    address && chainId ? ['loanTickets', address, chainId] : null,
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
