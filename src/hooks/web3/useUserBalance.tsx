import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { useState } from 'react'
import useSWR from 'swr'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { IERC20__factory } from '@/contracts/output'
import { wrapQueuedProvider } from '@/utils/rpc/rpcQueue'
import isPrivyEmbeddedWallet from '@/utils/web3/isPrivyEmbeddedWallet'

type UseUserBalanceOptions = {
  enabled?: boolean
}

const useUserBalance = (
  tokenAddress: string | undefined,
  options?: UseUserBalanceOptions
) => {
  const { address } = usePrivyAuthenticated()

  const { wallets } = useWallets()

  const wallet = wallets[0]
  const enabled = options?.enabled ?? true
  const addressLower = address?.toLowerCase()
  const walletAddressLower = wallet?.address?.toLowerCase()

  const [hasLoaded, setHasLoaded] = useState(false)

  const { decimals, symbol, error } = useTokenDetails(
    tokenAddress as `0x${string}`,
    { enabled: enabled && Boolean(tokenAddress) }
  )

  const {
    data: balance,
    error: balanceError,
    isLoading,
    mutate: refetchUserBalance,
  } = useSWR(
    enabled && wallet && addressLower && tokenAddress
      ? [
          'userBalance',
          tokenAddress.toLowerCase(),
          addressLower,
          walletAddressLower,
        ]
      : null,
    async () => {
      const privyProvider = wrapQueuedProvider(
        await wallet.getEthereumProvider(),
        { sponsorTransactions: isPrivyEmbeddedWallet(wallet) }
      )
      if (!privyProvider) {
        throw new Error('Wallet provider not available')
      }

      const provider = new ethers.providers.Web3Provider(privyProvider)

      const erc20 = IERC20__factory.connect(tokenAddress as string, provider)

      return await erc20.balanceOf(addressLower as string)
    },
    { fallbackData: ethers.constants.Zero, onSuccess: () => setHasLoaded(true) }
  )

  return {
    balance,
    decimals,
    symbol,
    error: error || balanceError,
    isUserBalanceLoading: enabled && isLoading,
    hasLoaded,
    refetchUserBalance,
  }
}

export default useUserBalance
