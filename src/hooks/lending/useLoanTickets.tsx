import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import { LoanTicketDto } from '@/config/api.lendersAgreement'

const useLoanTickets = () => {
  const { account, chainId } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account && chainId ? ['loanTickets', account, chainId] : null,
    async ([_, userAddress, chainId]) => {
      const res = await fetch(
        '/api/loan-tickets?' +
          new URLSearchParams({
            chainId: chainId.toString(),
            userAddress: userAddress.toLowerCase(),
          })
      )

      const data: LoanTicketDto[] = await res.json()

      return data
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
