import { Skeleton } from '@mui/material'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useCallback } from 'react'
import { useChainId } from 'wagmi'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useCurrentEpochDepositedAmount from '@/hooks/lending/useCurrentEpochDepositedAmount'
import useCurrentEpochFtdAmount from '@/hooks/lending/useCurrentEpochFtdAmount'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useSupportedTokenUserBalances, {
  SupportedTokenUserBalances,
} from '@/hooks/web3/useSupportedTokenUserBalances'

import { ModalsKeys } from '@/context/modal/modal.types'

import getSwapAmount from '@/actions/getSwapAmount'
import { SupportedChainIds } from '@/connection/chains'
import { SupportedTokenInfo } from '@/constants/tokens'

const SelectedAssetInput = () => {
  const chainId = useChainId()

  const { modal } = useModalState()

  const { pool, currentEpoch } = modal[ModalsKeys.LEND]

  const {
    amountInUSD,
    selectedToken,
    trancheId,
    isValidating,
    setAmountInUSD,
  } = useDepositModalState()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  const {
    currentEpochDepositedAmount,
    isLoading: currentEpochDepositedAmountLoading,
  } = useCurrentEpochDepositedAmount(pool.id, trancheId)

  const { currentEpochFtdAmount, isLoading: currentEpochFtdAmountLoading } =
    useCurrentEpochFtdAmount(pool.id, currentEpoch, trancheId)

  const supportedTokens = useSupportedTokenInfo()

  const handleApplyConversion = useCallback(
    async (
      newAmount: string,
      chainId: SupportedChainIds,
      usdcInfo: SupportedTokenInfo,
      tokenBalance: SupportedTokenUserBalances
    ) => {
      setAmountInUSD(undefined)

      if (!chainId) return '0'

      const usdAmount = await getSwapAmount({
        chainId,
        fromToken: tokenBalance.address,
        toToken: usdcInfo.address,
        fromAmount: parseUnits(newAmount, tokenBalance.decimals).toString(),
      })

      const formattedAmount = formatUnits(usdAmount || '0', usdcInfo.decimals)

      setAmountInUSD(formattedAmount)

      return formattedAmount
    },
    [setAmountInUSD]
  )

  if (
    !supportedTokenUserBalances ||
    !supportedTokens ||
    currentEpochDepositedAmountLoading ||
    !currentEpochDepositedAmount ||
    currentEpochFtdAmountLoading
  ) {
    return (
      <Skeleton
        variant='rounded'
        sx={{ bgcolor: 'gold.extraDark' }}
        height={60}
      />
    )
  }
}

export default SelectedAssetInput
