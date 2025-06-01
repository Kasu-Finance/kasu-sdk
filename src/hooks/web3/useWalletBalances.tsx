import { formatUnits } from 'ethers/lib/utils'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import sdkConfig from '@/config/sdk'
import { SupportedTokens } from '@/constants/tokens'
import { toBigNumber } from '@/utils'

type WalletBalanceParam = {
  showZeroAmounts?: boolean
}

const useWalletBalances = (options?: WalletBalanceParam) => {
  const supportedToken = useSupportedTokenInfo()

  const {
    balance: ksuBalance,
    decimals: ksuDecimals,
    isUserBalanceLoading: ksuLoading,
    error: ksuError,
  } = useUserBalance(sdkConfig.contracts.KSUToken as `0x${string}`)

  const {
    balance: usdcBalance,
    decimals: usdcDecimals,
    isUserBalanceLoading: usdcLoading,
    error: usdcError,
  } = useUserBalance(supportedToken?.[SupportedTokens.USDC].address)

  const walletBalances = {
    KASU: formatUnits(ksuBalance, ksuDecimals),
    usdc: formatUnits(usdcBalance, usdcDecimals),
  } as const

  const walletWithBalance = Object.entries(walletBalances)
    .filter(
      ([_, amount]) =>
        !toBigNumber(amount).isZero() || Boolean(options?.showZeroAmounts)
    )
    .map(([symbol, amount]) => ({ amount, symbol }))

  return {
    walletWithBalance,
    isLoading: ksuLoading || usdcLoading,
    error: ksuError || usdcError,
  }
}

export default useWalletBalances
