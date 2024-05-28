import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useSWR from 'swr'

import useUserBalance from '@/hooks/web3/useUserBalance'

import { UsdcIcon } from '@/assets/icons'
import FallbackIcon from '@/assets/icons/tokens/FallbackIcon'

import getTokenPrice from '@/actions/getTokenPrice'
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

  const supportedTokens = {
    [SupportedTokens.ETH]: {
      symbol: 'ETH',
      name: 'Wrapper Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`,
      decimals: 18,
      icon: FallbackIcon(),
    },
    [SupportedTokens.USDC]: {
      symbol: SupportedTokens.USDC,
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
      decimals: 6,
      icon: UsdcIcon(),
    },
    [SupportedTokens.USDT]: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xea3983Fc6D0fbbC41fb6F6091f68F3e08894dC06' as `0x${string}`,
      decimals: 18,
      icon: FallbackIcon(),
    },
  } as const

  const { balance } = useUserBalance(
    supportedTokens?.[SupportedTokens.USDC].address
  )

  const { data, error } = useSWR(
    provider && account && supportedTokens && balance
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

      const tokenPrices = await getTokenPrice(filteredTokens)

      const tokenWithBalances = await Promise.allSettled(
        Object.values(tokens).map(async (token) => {
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
      dedupingInterval: TimeConversions.SECONDS_PER_MINUTE * 1000,
      refreshInterval: TimeConversions.SECONDS_PER_MINUTE * 1000,
    }
  )

  return { supportedTokenUserBalances: data, error }
}

export default useSupportedTokenUserBalances
