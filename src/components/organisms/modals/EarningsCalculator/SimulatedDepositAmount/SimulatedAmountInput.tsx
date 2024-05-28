import LoginIcon from '@mui/icons-material/Login'
import { Box, Skeleton, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useDebounce from '@/hooks/useDebounce'
import { SupportedTokenUserBalances } from '@/hooks/web3/useSupportedTokenUserBalances'

import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import getSwapAmount from '@/actions/getSwapAmount'
import { SupportedChainIds } from '@/connection/chains'
import { SupportedTokenInfo, SupportedTokens } from '@/constants/tokens'
import { formatAmount, toBigNumber } from '@/utils'

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

  const { amount } = useDepositModalState()

  const [amountInUSD, setAmountInUSD] = useState<string | undefined>(undefined)

  const { balance, address, decimals, symbol } = supportedTokenUserBalance

  const handleAmountChange = useCallback(
    async (
      chainId: SupportedChainIds,
      fromToken: `0x${string}`,
      toToken: `0x${string}`,
      fromAmount: string
    ) => {
      setAmountInUSD(undefined)

      const amount = await getSwapAmount({
        chainId: 1,
        fromAmount,
        fromToken,
        toToken,
      })

      setAmountInUSD(formatUnits(amount, usdcInfo.decimals))
    },

    [usdcInfo]
  )

  const { debouncedFunction, isDebouncing } = useDebounce(
    handleAmountChange,
    1100
  )

  useEffect(() => {
    if (
      !chainId ||
      !amount ||
      supportedTokenUserBalance.symbol === SupportedTokens.USDC
    )
      return

    debouncedFunction(
      chainId,
      supportedTokenUserBalance.address,
      usdcInfo.address,
      parseUnits(amount, supportedTokenUserBalance.decimals).toString()
    )
  }, [chainId, amount, supportedTokenUserBalance, usdcInfo, debouncedFunction])

  return (
    <DepositAmountInput
      decimals={decimals}
      balance={formatUnits(balance, decimals)}
      poolData={poolData}
      endAdornment={
        supportedTokenUserBalance.symbol === SupportedTokens.USDC ? (
          ''
        ) : isDebouncing || !amountInUSD ? (
          <Skeleton variant='rounded' width={100} height={30} />
        ) : (
          <Typography
            whiteSpace='nowrap'
            variant='inherit'
            component='span'
            color={(theme) => theme.palette.text.disabled}
          >
            {usdcInfo.symbol} ~{formatAmount(amountInUSD)}
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
      convertedUsdAmount={
        supportedTokenUserBalance.symbol === SupportedTokens.USDC ||
        !amountInUSD
          ? undefined
          : toBigNumber(amountInUSD)
      }
    />
  )
}

export default SimulatedAmountInput
