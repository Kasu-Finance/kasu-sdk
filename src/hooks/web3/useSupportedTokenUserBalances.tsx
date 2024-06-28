import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useSWR from 'swr'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

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
  const { account, provider } = useWeb3React()

  const supportedTokens = useSupportedTokenInfo()

  const { balance, isUserBalanceLoading } = useUserBalance(
    supportedTokens?.[SupportedTokens.USDC].address
  )

  const { data, error } = useSWR(
    // add isUserBalanceLoading here to prevent rerenders because
    // useUserBalance returns a fallback data when balance is not loaded
    provider && account && supportedTokens && balance && !isUserBalanceLoading
      ? [
          'userbalance-supported-tokens',
          provider,
          account,
          supportedTokens,
          balance,
        ]
      : null,
    async ([_, library, userAddress, tokens, usdcBalance]) => {
      const USDC = tokens[SupportedTokens.USDC]

      const filteredTokens = Object.keys(tokens).filter(
        (key) => key !== SupportedTokens.USDC
      ) as SupportedTokens[]

      let tokenPrices: Record<SupportedTokens, string>

      if (filteredTokens.length) {
        const response = await fetch(
          `/api/token?${new URLSearchParams({
            tokens: filteredTokens.join(','),
          })}`
        )

        const data = (await response.json()) as {
          prices: Record<SupportedTokens, string>
        }

        tokenPrices = data.prices
      }

      const tokenWithBalances = await Promise.allSettled(
        (Object.values(tokens) as SupportedTokenInfo[]).map(async (token) => {
          if (token.symbol === USDC.symbol) {
            return { ...token, balance: usdcBalance, balanceInUSD: usdcBalance }
          }

          if (token.symbol === SupportedTokens.ETH) {
            const ethBalance = await library.getBalance(userAddress)

            const balanceInUSD = convertToUSD(
              ethBalance,
              toBigNumber(tokenPrices[token.symbol])
            )

            return { ...token, balance: ethBalance, balanceInUSD }
          }

          const erc20 = IERC20__factory.connect(token.address, library)
          const balance = await erc20.balanceOf(userAddress)

          const balanceInUSD = convertToUSD(
            balance,
            toBigNumber(tokenPrices[token.symbol], token.decimals)
          )
          return { ...token, balance, balanceInUSD }
        })
      )

      return tokenWithBalances.filter(isFulfilledPromise).reduce(
        (acc, { value }) => {
          return { ...acc, [value.symbol]: value }
        },
        {} as Record<SupportedTokens, SupportedTokenUserBalances>
      )
    },
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        const RETRY_TIMES = 5
        const RETRY_INTERVAL = 2000

        if (retryCount >= RETRY_TIMES) return

        setTimeout(() => revalidate({ retryCount }), RETRY_INTERVAL)
      },
      dedupingInterval: TimeConversions.SECONDS_PER_MINUTE * 1000,
      refreshInterval: TimeConversions.SECONDS_PER_MINUTE * 1000,
      keepPreviousData: true,
    }
  )

  return { supportedTokenUserBalances: data, error }
}

export default useSupportedTokenUserBalances
