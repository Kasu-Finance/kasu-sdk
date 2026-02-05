import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { LoanTicketDto, LoanTicketDtoRaw } from '@/config/api.lendersAgreement'
import { FIVE_MINUTES } from '@/constants/general'
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

      // Handle non-OK responses (e.g., 401 Unauthorized for unsupported chains)
      if (!res.ok) {
        // Return empty array instead of throwing - this prevents retries
        // and allows the UI to show empty state gracefully
        console.warn(
          `Loan tickets API returned ${res.status} for chain ${chainId}`
        )
        return []
      }

      const data: LoanTicketDtoRaw[] = await res.json()

      // Handle error responses that come as JSON with message field
      if (!Array.isArray(data)) {
        console.warn('Loan tickets API returned non-array response:', data)
        return []
      }

      return data.map((data) => ({
        ...data,
        dailyGroupID: dayjs(data.createdOn).startOf('day').toISOString(),
      }))
    },
    {
      dedupingInterval: FIVE_MINUTES,
      revalidateIfStale: false,
      errorRetryCount: 0, // Don't retry on error
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
