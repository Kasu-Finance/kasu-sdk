import { KasuSdk } from '@solidant/kasu-sdk'
import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { SupportedTokens } from '@/constants/tokens'

const useTotalLendingPoolDeposits = () => {
  const { account } = useWeb3React()
  const sdk = useKasuSDK()

  const supportedToken = useSupportedTokenInfo()

  const { data, error, isLoading, mutate } = useSWR(
    account && sdk ? ['totalPoolDeposits', account, sdk] : null,
    async (account: string, sdk: KasuSdk) =>
      sdk.UserLending.getUserTotalPendingAndActiveDepositedAmount(account),

    {
      shouldRetryOnError: false,
      revalidateOnFocus: true,
    }
  )

  const { activeDepositAmount, pendingDepositAmount } = useMemo(() => {
    if (!data) {
      return { activeDepositAmount: '0.00', pendingDepositAmount: '0.00' }
    }

    const [activeDepositAmount, pendingDepositAmount] = data

    const active = formatUnits(
      activeDepositAmount || '0',
      supportedToken?.[SupportedTokens.USDC].decimals
    )
    const pending = formatUnits(
      pendingDepositAmount || '0',
      supportedToken?.[SupportedTokens.USDC].decimals
    )
    return { activeDepositAmount: active, pendingDepositAmount: pending }
  }, [data, supportedToken])

  return {
    totalDeposits: { activeDepositAmount, pendingDepositAmount },
    error,
    isLoading,
    refresh: mutate,
  }
}

export default useTotalLendingPoolDeposits
