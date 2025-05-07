import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { useState } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { IERC20__factory } from '@/contracts/output'

const useUserBalance = (tokenAddress: string | undefined) => {
  const account = useAccount()

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
  } = useSWR(
    wallet && account.address && tokenAddress
      ? [`userBalance-${tokenAddress}`, wallet, account.address, tokenAddress]
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
  }
}

export default useUserBalance

// import { IERC20__factory } from '@/contracts/output'
// import { BigNumber } from 'ethers'
// import { zeroAddress } from 'viem'
// import { useAccount, useReadContracts } from 'wagmi'

// const useUserBalance = (tokenAddress: `0x${string}` | undefined) => {
//   const { address } = useAccount()

//   const { data, isLoading, error } = useReadContracts({
//     allowFailure: false,
//     contracts: [
//       {
//         address: tokenAddress,
//         abi: IERC20__factory.abi,
//         functionName: 'balanceOf',
//         args: [address ?? zeroAddress],
//       },
//       {
//         address: tokenAddress,
//         abi: IERC20__factory.abi,
//         functionName: 'decimals',
//       },
//       {
//         address: tokenAddress,
//         abi: IERC20__factory.abi,
//         functionName: 'symbol',
//       },
//     ],
//   })

//   return {
//     balance: BigNumber.from(data?.[0] ?? 0),
//     decimals: data?.[1],
//     symbol: data?.[2],
//     error,
//     isUserBalanceLoading: isLoading,
//   }
// }

// export default useUserBalance
