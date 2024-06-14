import LoginIcon from '@mui/icons-material/Login'
import { Box, Skeleton, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useCallback } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import { SupportedTokenUserBalances } from '@/hooks/web3/useSupportedTokenUserBalances'

import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import getSwapAmount from '@/actions/getSwapAmount'
import { SupportedChainIds } from '@/connection/chains'
import { SupportedTokenInfo, SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'

type SwapAndDepositInputProps = {
  supportedTokenUserBalance:
    | Record<SupportedTokens, SupportedTokenUserBalances>
    | undefined
  poolData: PoolData
}

const SwapAndDepositInput: React.FC<SwapAndDepositInputProps> = ({
  supportedTokenUserBalance,
  poolData,
}) => {
  const { chainId } = useWeb3React()

  const { amount, amountInUSD, selectedToken, setAmountInUSD } =
    useDepositModalState()

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

  if (!supportedTokenUserBalance || !supportedTokens) {
    return <Skeleton variant='rounded' height={60} />
  }

  const usdcInfo = supportedTokens[SupportedTokens.USDC]

  const tokenBalance = supportedTokenUserBalance[selectedToken]

  return (
    <DepositAmountInput
      decimals={tokenBalance.decimals}
      balance={formatUnits(tokenBalance.balance, tokenBalance.decimals)}
      poolData={poolData}
      endAdornment={
        tokenBalance.symbol === SupportedTokens.USDC ? (
          ''
        ) : !amountInUSD && amount ? (
          <Skeleton variant='rounded' width={100} height={30} />
        ) : (
          <Typography
            whiteSpace='nowrap'
            variant='inherit'
            component='span'
            color={(theme) => theme.palette.text.disabled}
          >
            {usdcInfo.symbol} ~
            {formatAmount(amountInUSD || 0, { maxDecimals: 4 })}
          </Typography>
        )
      }
      startAdornment={
        <Box display='flex' alignItems='center'>
          <LoginIcon sx={{ mr: 1 }} />
          <Typography
            variant='inherit'
            component='span'
            color={(theme) => theme.palette.text.disabled}
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
      debounceTime={1200}
    />
  )
}

export default SwapAndDepositInput
