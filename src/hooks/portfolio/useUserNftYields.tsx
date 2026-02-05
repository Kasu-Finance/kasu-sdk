import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
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

type UseUserNftYieldsOptions = {
  enabled?: boolean
}

const useUserNftYields = (options?: UseUserNftYieldsOptions) => {
  const { address } = usePrivyAuthenticated()

  const { currentChainId: chainId } = useChain()
  const enabled = options?.enabled ?? true

  const { data, error, isLoading, mutate } = useSWR(
    enabled && address && chainId ? ['userNftYields', address, chainId] : null,
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
    isLoading:
      enabled &&
      Boolean(address) &&
      (!chainId || isLoading || (!data && !error)),
    updateUserNftYields: mutate,
  }
}

export default useUserNftYields
