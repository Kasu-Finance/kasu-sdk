import useSWR from 'swr'
import { readContracts } from 'wagmi/actions'

import { wagmiConfig } from '@/context/privy.provider'

import { IERC20__factory } from '@/contracts/output'

const useTokenDetails = (tokenAddress: `0x${string}` | undefined) => {
  const error = !tokenAddress
    ? new Error('useTokenDetails: tokenAddress is not defined')
    : undefined

  const { data, error: rpcError } = useSWR(
    tokenAddress ? ['symbol', tokenAddress] : null,
    async ([_, tokenAddress]) => {
      const [symbol, decimals] = await readContracts(wagmiConfig, {
        allowFailure: false,
        contracts: [
          {
            abi: IERC20__factory.abi,
            address: tokenAddress,
            functionName: 'symbol',
          },
          {
            abi: IERC20__factory.abi,
            address: tokenAddress,
            functionName: 'decimals',
          },
        ],
      })
      return { symbol, decimals }
    }
  )

  return {
    symbol: data?.symbol,
    decimals: data?.decimals,
    isLoading: !data && !error,
    error: rpcError || error,
  }
}

export default useTokenDetails
