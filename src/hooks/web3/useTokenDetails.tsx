import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import { IERC20__factory } from '@/contracts/output'

const useTokenDetails = (tokenAddress: string | undefined) => {
  const { provider } = useWeb3React()

  const error = !tokenAddress
    ? new Error('useTokenDetails: tokenAddress is not defined')
    : undefined

  const { data, error: rpcError } = useSWR(
    provider && tokenAddress ? ['symbol', tokenAddress, provider] : null,
    async ([_, tokenAddress, provider]) => {
      const erc20 = IERC20__factory.connect(tokenAddress, provider)

      const symbol = await erc20.symbol()
      const decimals = await erc20.decimals()

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
