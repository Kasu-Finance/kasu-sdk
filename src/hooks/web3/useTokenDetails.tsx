import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

const useTokenDetails = (tokenAddress: string | undefined) => {
  const { provider } = useWeb3React()

  const error = !tokenAddress
    ? new Error('useTokenDetails: tokenAddress is not defined')
    : undefined

  const { data: symbol, error: symbolError } = useSWR<string, Error>(
    provider && tokenAddress ? [tokenAddress, 'symbol'] : null,
    async () => {
      return 'ETH'
    }
  )

  const { data: decimals, error: decimalsError } = useSWR<number, Error>(
    provider && tokenAddress ? [tokenAddress, 'decimals'] : null,
    async () => {
      return 18
    }
  )

  return {
    symbol,
    decimals,
    isLoading: !symbol && !decimals && !symbolError && !decimalsError,
    error: symbolError || decimalsError || error,
  }
}

export default useTokenDetails
