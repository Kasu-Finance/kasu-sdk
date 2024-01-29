import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { IERC20__factory } from '@/contracts/output'

const useUserBalance = (tokenAddress: string | undefined) => {
  const { account, provider } = useWeb3React()

  const { decimals, symbol } = useTokenDetails(tokenAddress)

  const { data: balance } = useSWR(
    provider && account && tokenAddress
      ? [`userBalance-${tokenAddress}`, provider, account, tokenAddress]
      : null,
    async ([_, library, userAddress, token]) => {
      const erc20 = IERC20__factory.connect(token, library)

      const balance = await erc20.balanceOf(userAddress)

      return balance
    }
  )

  return { balance, decimals, symbol }
}

export default useUserBalance
