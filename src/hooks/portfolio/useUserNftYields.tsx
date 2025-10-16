import useSWR from 'swr'
import { useChainId } from 'wagmi'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { NftRes } from '@/app/api/nft/route'

export type UserNftYield = {
  poolAddress: string
  epochIds: string[]
  baseYield: string
  boostPct: string
  boostedYield: string
  epochBoost: string
  totalBoost: string
}

const useUserNftYields = () => {
  const { address } = usePrivyAuthenticated()

  const chainId = useChainId()

  const { data, error, isLoading } = useSWR(
    address && chainId ? ['userNftYields', address, chainId] : null,
    async ([_, userAddress, chainId]): Promise<UserNftYield> => {
      const res = await fetch(
        '/api/nft?' +
          new URLSearchParams({
            chainId: chainId.toString(),
          }),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: userAddress }),
        }
      )

      const data: NftRes = await res.json()

      if ('message' in data) {
        throw new Error(data.message)
      }

      return data.items.sort(
        (a, b) =>
          Math.max(...b.epochIds.map((epoch) => parseFloat(epoch))) -
          Math.max(...a.epochIds.map((epoch) => parseFloat(epoch)))
      )[0]
    }
  )

  return {
    userNftYields: data,
    error,
    isLoading: isLoading || (!data && !error),
  }
}

export default useUserNftYields
