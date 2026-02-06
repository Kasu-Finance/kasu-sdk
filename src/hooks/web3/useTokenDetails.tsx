import useSWR from 'swr'
import { readContracts } from 'wagmi/actions'

import { useChain } from '@/hooks/context/useChain'

import { wagmiConfig } from '@/context/privy.provider'

import { SupportedChainIds } from '@/connection/chains'
import { IERC20__factory } from '@/contracts/output'

type UseTokenDetailsOptions = {
  enabled?: boolean
}

const useTokenDetails = (
  tokenAddress: `0x${string}` | undefined,
  options?: UseTokenDetailsOptions
) => {
  const { currentChainId } = useChain()
  const enabled = options?.enabled ?? true
  const error =
    enabled && !tokenAddress
      ? new Error('useTokenDetails: tokenAddress is not defined')
      : undefined

  const { data, error: rpcError } = useSWR(
    enabled && tokenAddress && currentChainId
      ? ['symbol', currentChainId, tokenAddress]
      : null,
    async ([_, chainId, tokenAddress]) => {
      const [symbol, decimals] = await readContracts(wagmiConfig, {
        allowFailure: false,
        contracts: [
          {
            abi: IERC20__factory.abi,
            address: tokenAddress,
            functionName: 'symbol',
            chainId: chainId as SupportedChainIds,
          },
          {
            abi: IERC20__factory.abi,
            address: tokenAddress,
            functionName: 'decimals',
            chainId: chainId as SupportedChainIds,
          },
        ],
      })
      return { symbol, decimals }
    }
  )

  return {
    symbol: data?.symbol,
    decimals: data?.decimals,
    isLoading: enabled && !data && !error,
    error: rpcError || error,
  }
}

export default useTokenDetails
