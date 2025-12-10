import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { useState } from 'react'
import useSWR from 'swr'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { IERC20__factory } from '@/contracts/output'

const useUserBalance = (tokenAddress: string | undefined) => {
  const { address } = usePrivyAuthenticated()

  const { wallets } = useWallets()

  const wallet = wallets[0]

  const [hasLoaded, setHasLoaded] = useState(false)

  const { decimals, symbol, error } = useTokenDetails(
    tokenAddress as `0x${string}`
  )

  const {
    data: balance,
    error: balanceError,
    isLoading,
    mutate: refetchUserBalance,
  } = useSWR(
    wallet && address && tokenAddress
      ? [`userBalance-${tokenAddress}`, wallet, address, tokenAddress]
      : null,
    async ([_, wallet, userAddress, token]) => {
      const privyProvider = await wallet.getEthereumProvider()

      const provider = new ethers.providers.Web3Provider(privyProvider)

      const erc20 = IERC20__factory.connect(token, provider)

      const balance = await erc20.balanceOf(userAddress)

      return balance
    },
    { fallbackData: ethers.constants.Zero, onSuccess: () => setHasLoaded(true) }
  )

  return {
    balance,
    decimals,
    symbol,
    error: error || balanceError,
    isUserBalanceLoading: isLoading,
    hasLoaded,
    refetchUserBalance,
  }
}

export default useUserBalance
