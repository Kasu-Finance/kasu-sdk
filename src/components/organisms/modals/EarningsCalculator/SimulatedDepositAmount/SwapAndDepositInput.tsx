import LoginIcon from '@mui/icons-material/Login'
import { Box, Skeleton, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useCallback } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import { SupportedTokenUserBalances } from '@/hooks/web3/useSupportedTokenUserBalances'

import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import { UsdcIcon } from '@/assets/icons'
import FallbackIcon from '@/assets/icons/tokens/FallbackIcon'

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
        chainId: 1,
        fromToken: tokenBalance.address,
        toToken: usdcInfo.address,
        fromAmount: parseUnits(newAmount, tokenBalance.decimals).toString(),
      })

      const formattedAmount = formatUnits(usdAmount, usdcInfo.decimals)

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
            {usdcInfo.symbol} ~{formatAmount(amountInUSD || 0)}
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
