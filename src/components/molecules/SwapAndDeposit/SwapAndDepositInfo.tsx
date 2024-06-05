import { Skeleton, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import { SupportedTokenUserBalances } from '@/hooks/web3/useSupportedTokenUserBalances'

import ColoredBox from '@/components/atoms/ColoredBox'
import ToolTip from '@/components/atoms/ToolTip'

import OneInchLogo from '@/assets/logo/OneInchLogo'

import { ONE_INCH_SLIPPAGE } from '@/config/api.oneInch'
import { SupportedTokens } from '@/constants/tokens'
import { formatAmount, formatPercentage } from '@/utils'

type SwapAndDepositInfoProps = {
  supportedTokenUserBalance:
    | Record<SupportedTokens, SupportedTokenUserBalances>
    | undefined
}

const SwapAndDepositInfo: React.FC<SwapAndDepositInfoProps> = ({
  supportedTokenUserBalance,
}) => {
  const { modalStatus } = useModalStatusState()

  const { amount, amountInUSD, selectedToken } = useDepositModalState()

  if (!supportedTokenUserBalance || selectedToken === SupportedTokens.USDC)
    return null

  const symbol = ''
  // const symbol = supportedTokenUserBalance[selectedToken].symbol || ''

  return (
    <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, p: 2 }}>
      <Box display='flex' alignItems='center'>
        <OneInchLogo />
        <Typography
          variant='subtitle2'
          component='p'
          fontWeight={400}
          ml={1}
          color={(theme) => theme.palette.text.secondary}
        >
          Swapped via 1inch
        </Typography>
      </Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mt={1.5}
      >
        <Typography
          variant='subtitle2'
          component='p'
          fontWeight={400}
          color={(theme) => theme.palette.text.secondary}
        >
          Swap{' '}
          <Typography
            variant='inherit'
            component='span'
            color={(theme) => theme.palette.text.primary}
          >
            {formatAmount(amount)} {symbol}
          </Typography>{' '}
          for{' '}
          {!amountInUSD && amount ? (
            <Skeleton width={50} sx={{ display: 'inline-block' }} />
          ) : (
            <Typography
              variant='inherit'
              component='span'
              color={(theme) => theme.palette.text.primary}
            >
              {formatAmount(amountInUSD || '0')}
            </Typography>
          )}{' '}
          USDC
        </Typography>
        <Box display='flex' alignContent='center'>
          <Typography variant='subtitle2' component='p' fontWeight={400}>
            Slippage
          </Typography>

          <ToolTip title='info' />
          <Typography variant='subtitle2' component='p' ml={1}>
            {formatPercentage(ONE_INCH_SLIPPAGE)}
          </Typography>
        </Box>
      </Box>
    </ColoredBox>
  )
}

export default SwapAndDepositInfo
