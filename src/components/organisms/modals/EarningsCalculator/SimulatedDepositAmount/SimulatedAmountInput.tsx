import LoginIcon from '@mui/icons-material/Login'
import { Box, Skeleton, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useCallback } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import { SupportedTokenUserBalances } from '@/hooks/web3/useSupportedTokenUserBalances'

import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import getSwapAmount from '@/actions/getSwapAmount'
import { SupportedChainIds } from '@/connection/chains'
import { SupportedTokenInfo, SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'

type SimulatedAmountInputProps = {
  usdcInfo: SupportedTokenInfo
  supportedTokenUserBalance: SupportedTokenUserBalances
  poolData: PoolData
}

const SimulatedAmountInput: React.FC<SimulatedAmountInputProps> = ({
  supportedTokenUserBalance,
  poolData,
  usdcInfo,
}) => {
  const { chainId } = useWeb3React()

  const { amount, amountInUSD, setAmountInUSD } = useDepositModalState()

  const { balance, decimals, symbol } = supportedTokenUserBalance

  const handleApplyConversion = useCallback(
    async (newAmount: string, chainId?: SupportedChainIds) => {
      setAmountInUSD(undefined)

      if (!chainId) return '0'

      const usdAmount = await getSwapAmount({
        chainId: 1,
        fromToken: supportedTokenUserBalance.address,
        toToken: usdcInfo.address,
        fromAmount: parseUnits(
          newAmount,
          supportedTokenUserBalance.decimals
        ).toString(),
      })

      const formattedAmount = formatUnits(usdAmount, usdcInfo.decimals)

      setAmountInUSD(formattedAmount)

      return formattedAmount
    },
    [usdcInfo, supportedTokenUserBalance, setAmountInUSD]
  )

  return (
    <DepositAmountInput
      decimals={decimals}
      balance={formatUnits(balance, decimals)}
      poolData={poolData}
      endAdornment={
        supportedTokenUserBalance.symbol === SupportedTokens.USDC ? (
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
            {symbol}
          </Typography>
        </Box>
      }
      applyConversion={
        !chainId || supportedTokenUserBalance.symbol === SupportedTokens.USDC
          ? undefined
          : (newAmount) => handleApplyConversion(newAmount, chainId)
      }
      debounceTime={1200}
    />
  )
}

export default SimulatedAmountInput
