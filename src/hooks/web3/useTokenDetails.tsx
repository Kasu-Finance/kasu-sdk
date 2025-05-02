import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import useSWR from 'swr'

import { IERC20__factory } from '@/contracts/output'

const useTokenDetails = (tokenAddress: string | undefined) => {
  const { wallets } = useWallets()

  const wallet = wallets[0]

  const error = !tokenAddress
    ? new Error('useTokenDetails: tokenAddress is not defined')
    : undefined

  const { data, error: rpcError } = useSWR(
    wallet && tokenAddress ? ['symbol', tokenAddress, wallet] : null,
    async ([_, tokenAddress, wallet]) => {
      const privyProvider = await wallet.getEthereumProvider()

      const provider = new ethers.providers.Web3Provider(privyProvider)

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
