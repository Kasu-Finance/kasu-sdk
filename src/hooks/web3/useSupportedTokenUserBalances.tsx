import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { SupportedTokens } from '@/constants/tokens'
import { IERC20__factory } from '@/contracts/output'
import { isFulfilledPromise } from '@/utils'

const useSupportedTokenUserBalances = () => {
  const { account, provider } = useWeb3React()

  const supportedTokens = useSupportedTokenInfo()

  const { balance: usdcBalance } = useUserBalance(
    supportedTokens?.[SupportedTokens.USDC].address
  )

  const { data } = useSWR(
    provider && account && supportedTokens && usdcBalance
      ? [
          'userbalance-supported-tokens',
          provider,
          account,
          supportedTokens,
          usdcBalance,
        ]
      : null,
    async ([_, library, userAddress, tokens, usdcBalance]) => {
      const tokenWithBalances = await Promise.allSettled(
        Object.values(tokens).map(async (token) => {
          if (token.symbol === 'USDC') {
            return { ...token, balance: usdcBalance }
          }

          const erc20 = IERC20__factory.connect(token.address, library)

          const balance = await erc20.balanceOf(userAddress)

          return { ...token, balance }
        })
      )

      return tokenWithBalances
        .filter(isFulfilledPromise)
        .map(({ value }) => value)
    }
  )

  return data
}

export default useSupportedTokenUserBalances
