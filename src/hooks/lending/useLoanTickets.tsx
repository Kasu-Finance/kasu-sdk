import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { LoanTicketDto, LoanTicketDtoRaw } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'

const useLoanTickets = () => {
  const { address } = usePrivyAuthenticated()
  const { currentChainId } = useChain()

  const { data, error, isLoading, mutate } = useSWR(
    address && currentChainId ? ['loanTickets', address, currentChainId] : null,
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
