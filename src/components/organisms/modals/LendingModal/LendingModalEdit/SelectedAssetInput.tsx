import { Box, Skeleton, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useCallback } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useCurrentEpochDepositedAmount from '@/hooks/lending/useCurrentEpochDepositedAmount'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useSupportedTokenUserBalances, {
  SupportedTokenUserBalances,
} from '@/hooks/web3/useSupportedTokenUserBalances'

import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'

import { ModalsKeys } from '@/context/modal/modal.types'

import getSwapAmount from '@/actions/getSwapAmount'
import { SupportedChainIds } from '@/connection/chains'
import { SupportedTokenInfo, SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'

const SelectedAssetInput = () => {
  const { chainId } = useWeb3React()

  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

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
    !currentEpochDepositedAmount
  ) {
    return (
      <Skeleton
        variant='rounded'
        sx={{ bgcolor: 'gold.extraDark' }}
        height={60}
      />
    )
  }

  const usdcInfo = supportedTokens[SupportedTokens.USDC]

  const token = supportedTokens[selectedToken]

  const tokenBalance = supportedTokenUserBalances[selectedToken]

  return (
    <DepositAmountInput
      decimals={tokenBalance.decimals}
      balance={formatUnits(tokenBalance.balance, tokenBalance.decimals)}
      poolData={pool}
      currentEpochDepositedAmount={currentEpochDepositedAmount}
      endAdornment={
        tokenBalance.symbol === SupportedTokens.USDC ? (
          ''
        ) : isValidating ? (
          <Skeleton
            variant='rounded'
            sx={{ bgcolor: 'gold.extraDark' }}
            width={100}
            height={30}
          />
        ) : (
          <Typography
            whiteSpace='nowrap'
            variant='inherit'
            component='span'
            color='gold.extraDark'
          >
            {usdcInfo.symbol} ~
            {formatAmount(amountInUSD || 0, { maxDecimals: 4 })}
          </Typography>
        )
      }
      startAdornment={
        <Box display='flex' alignItems='center'>
          {token.icon.dark}
          <Typography
            variant='inherit'
            component='span'
            color='gold.extraDark'
            ml={1}
          >
            {tokenBalance.symbol}
          </Typography>
        </Box>
      }
      applyConversion={
        !chainId || tokenBalance.symbol === SupportedTokens.USDC
          ? undefined
          : (newAmount) =>
              handleApplyConversion(newAmount, chainId, usdcInfo, tokenBalance)
      }
      debounceTime={500}
    />
  )
}

export default SelectedAssetInput
