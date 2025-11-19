import { BigNumber } from 'ethers'
import useSWR from 'swr'
import { getBalance, readContract } from 'wagmi/actions'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { wagmiConfig } from '@/context/privy.provider'

import { SupportedTokenInfo, SupportedTokens } from '@/constants/tokens'
import { IERC20__factory } from '@/contracts/output'
import {
  convertToUSD,
  isFulfilledPromise,
  TimeConversions,
  toBigNumber,
} from '@/utils'

export type SupportedTokenUserBalances = SupportedTokenInfo & {
  balance: BigNumber
  balanceInUSD: BigNumber
}

const useSupportedTokenUserBalances = () => {
  const { address } = usePrivyAuthenticated()

  const supportedTokens = useSupportedTokenInfo()

  const { balance, isUserBalanceLoading } = useUserBalance(
    supportedTokens?.[SupportedTokens.USDC].address
  )

  const { data, error } = useSWR(
    // add isUserBalanceLoading here to prevent rerenders because
    // useUserBalance returns a fallback data when balance is not loaded
    address && balance && !isUserBalanceLoading
      ? ['userbalance-supported-tokens', address, balance]
      : null,
    async ([_, userAddress, usdcBalance]) => {
      if (!supportedTokens) return

      const USDC = supportedTokens[SupportedTokens.USDC]

      const filteredTokens = Object.keys(supportedTokens).filter(
        (key) => key !== SupportedTokens.USDC
      ) as SupportedTokens[]

      let tokenPrices: Record<SupportedTokens, string>

      if (filteredTokens.length) {
        const response = await fetch(
          `/api/token?${new URLSearchParams({
            tokens: filteredTokens.join(','),
          })}`
        )

        const data = (await response.json()) as Record<SupportedTokens, string>

        tokenPrices = data
      }

      const tokenWithBalances = await Promise.allSettled(
        (Object.values(supportedTokens) as SupportedTokenInfo[]).map(
          async (token) => {
            if (token.symbol === USDC.symbol) {
              return {
                ...token,
                balance: usdcBalance,
                balanceInUSD: usdcBalance,
              }
            }

            if (token.symbol === SupportedTokens.ETH) {
              const nativeTokenBalance = await getBalance(wagmiConfig, {
                address: userAddress,
              })

              const ethBalance = BigNumber.from(nativeTokenBalance.value)

              const balanceInUSD = convertToUSD(
                ethBalance,
                toBigNumber(tokenPrices[token.symbol])
              )

              return { ...token, balance: ethBalance, balanceInUSD }
            }

            const balance = await readContract(wagmiConfig, {
              abi: IERC20__factory.abi,
              functionName: 'balanceOf',
              args: [userAddress],
              address: token.address,
            })

            const balanceInUSD = convertToUSD(
              BigNumber.from(balance),
              toBigNumber(tokenPrices[token.symbol], token.decimals)
            )
            return { ...token, balance, balanceInUSD }
          }
        )
      )

      return tokenWithBalances.filter(isFulfilledPromise).reduce(
        (acc, { value }) => {
          return { ...acc, [value.symbol]: value }
        },
        {} as Record<SupportedTokens, SupportedTokenUserBalances>
      )
    },
    {
      dedupingInterval: TimeConversions.SECONDS_PER_MINUTE * 1000,
      refreshInterval: TimeConversions.SECONDS_PER_MINUTE * 1000,
      keepPreviousData: true,
    }
  )

  return { supportedTokenUserBalances: data, error }
}

export default useSupportedTokenUserBalances
