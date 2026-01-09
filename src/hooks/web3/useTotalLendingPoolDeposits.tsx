import type { KasuSdk } from '@kasufinance/kasu-sdk'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { SupportedTokens } from '@/constants/tokens'

type UseTotalLendingPoolDepositsOptions = {
  enabled?: boolean
  sdk?: KasuSdk
}

const useTotalLendingPoolDeposits = (
  options?: UseTotalLendingPoolDepositsOptions
) => {
  const { address } = usePrivyAuthenticated()
  const sdkFromContext = useSdk()
  const sdk = options?.sdk ?? sdkFromContext
  const enabled = options?.enabled ?? true

  const supportedToken = useSupportedTokenInfo()

  const { data, error, isLoading, mutate } = useSWR(
    enabled && address && sdk ? ['totalPoolDeposits', address, sdk] : null,
    async ([_, account, sdk]) =>
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
    isLoading: enabled && isLoading,
    refresh: mutate,
  }
}

export default useTotalLendingPoolDeposits
