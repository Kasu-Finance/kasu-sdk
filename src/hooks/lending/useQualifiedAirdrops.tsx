import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'

import { UserAirDropTicket } from '@/app/api/airdrop-tickets/route'

const useQualifiedAirdrops = () => {
  const { currentChainId: chainId } = useChain()

  const { data, error, isLoading } = useSWR(
    ['qualifiedAirdrops', chainId],
    async ([_, chainId]) => {
      const res = await fetch(
        '/api/airdrop-tickets?' +
          new URLSearchParams({
            chainId: chainId.toString(),
          }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const airDropTicket: UserAirDropTicket = await res.json()

      //   February 20th, 2025
      const targetTime = 1739980800

      const filtered = airDropTicket.results
        .filter(({ epochDate }) => epochDate > targetTime)
        .sort((a, b) => a.epochDate - b.epochDate)
        .slice(0, 200)

      return filtered
    }
  )

  return {
    qualifiedAirdrops: data,
    error,
    isLoading,
  }
}

export default useQualifiedAirdrops
