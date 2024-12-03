import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import { LoanTicketDto, LoanTicketDtoRaw } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'

const useLoanTickets = () => {
  const { account, chainId } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account && chainId ? ['loanTickets', account, chainId] : null,
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
