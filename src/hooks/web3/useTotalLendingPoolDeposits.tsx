import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { TOKENS } from '@/constants/tokens'

const useTotalLendingPoolDeposits = () => {
  const { account } = useWeb3React()
  const sdk = useKasuSDK()

  const fetchTotalPoolDeposits = async () => {
    if (!account) {
      throw new Error('Account not connected')
    }

    const result =
      await sdk.UserLending.getUserTotalPendingAndActiveDepositedAmount(account)

    if (!result) {
      throw new Error('useTotalLendingPoolDeposits No data available.')
    }

    return result
  }

  const { data, error, mutate } = useSWR(
    account ? ['totalPoolDeposits', account] : null,
    fetchTotalPoolDeposits,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: true,
    }
  )

  const { activeDepositAmount, pendingDepositAmount } = useMemo(() => {
    if (!data) {
      return { activeDepositAmount: '0.00', pendingDepositAmount: '0.00' }
    }
    const active = formatUnits(
      data.activeDepositAmount || '0',
      TOKENS.USDC.decimals
    )
    const pending = formatUnits(
      data.pendingDepositAmount || '0',
      TOKENS.USDC.decimals
    )
    return { activeDepositAmount: active, pendingDepositAmount: pending }
  }, [data])

  return {
    totalDeposits: { activeDepositAmount, pendingDepositAmount },
    error,
    isLoading: !data && !error,
    refresh: mutate,
  }
}

export default useTotalLendingPoolDeposits
