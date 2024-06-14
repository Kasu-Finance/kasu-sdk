import { Skeleton, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'
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
  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const { amount, amountInUSD, selectedToken } = useDepositModalState()

  if (!supportedTokenUserBalance || selectedToken === SupportedTokens.USDC)
    return null

  const symbol = supportedTokenUserBalance[selectedToken].symbol || ''

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
          {t('modals.lock.swapAndDeposit.swap-via')}
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
          {t('modals.lock.swapAndDeposit.swap')}{' '}
          <Typography
            variant='inherit'
            component='span'
            color={(theme) => theme.palette.text.primary}
          >
            {formatAmount(amount || '0', { maxDecimals: 4 })} {symbol}
          </Typography>{' '}
          {t('modals.lock.swapAndDeposit.for')}{' '}
          {!amountInUSD && amount ? (
            <Skeleton width={50} sx={{ display: 'inline-block' }} />
          ) : (
            <Typography
              variant='inherit'
              component='span'
              color={(theme) => theme.palette.text.primary}
            >
              {formatAmount(amountInUSD || '0', { maxDecimals: 4 })}
            </Typography>
          )}{' '}
          USDC
        </Typography>
        <Box display='flex' alignContent='center'>
          <Typography variant='subtitle2' component='p' fontWeight={400}>
            {t('general.slippage')}
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
