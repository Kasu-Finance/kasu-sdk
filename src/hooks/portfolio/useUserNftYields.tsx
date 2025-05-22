import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import { NftRes } from '@/app/api/nft/route'

const useUserNftYields = () => {
  const { account, chainId } = useWeb3React()

  const { data, error, isLoading } = useSWR(
    account && chainId ? ['userNftYields', account, chainId] : null,
    async ([_, userAddress, chainId]) => {
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
    isLoading,
  }
}

export default useUserNftYields
