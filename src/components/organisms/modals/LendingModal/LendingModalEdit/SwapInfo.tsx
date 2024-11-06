import { Skeleton, Typography } from '@mui/material'
import { Box } from '@mui/system'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import getTranslation from '@/hooks/useTranslation'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import ToolTip from '@/components/atoms/ToolTip'

import OneInchLogo from '@/assets/logo/OneInchLogo'

import { ONE_INCH_SLIPPAGE } from '@/config/api.oneInch'
import { SupportedTokens } from '@/constants/tokens'
import { formatAmount, formatPercentage } from '@/utils'

const SwapInfo = () => {
  const { t } = getTranslation()

  const { amount, amountInUSD, isValidating, selectedToken } =
    useDepositModalState()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  if (!supportedTokenUserBalances || selectedToken === SupportedTokens.USDC)
    return null

  const symbol = supportedTokenUserBalances[selectedToken].symbol || ''

  return (
    <Box sx={{ mt: `16px !important` }}>
      <Box display='flex' alignItems='center'>
        <OneInchLogo />
        <Typography variant='baseMd' component='p' fontWeight={400} ml={1}>
          {t('modals.lock.swapAndDeposit.swap-via')}
        </Typography>
      </Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mt={1.5}
      >
        <Typography variant='baseMd' component='p' fontWeight={400}>
          {t('modals.lock.swapAndDeposit.swap')}{' '}
          <Typography variant='baseMdBold' component='span'>
            {formatAmount(amount || '0', { minDecimals: 2, maxDecimals: 4 })}{' '}
            {symbol}
          </Typography>{' '}
          {t('modals.lock.swapAndDeposit.for')}{' '}
          {isValidating ? (
            <Skeleton
              width={50}
              sx={{ display: 'inline-block', bgcolor: 'gold.extraDark' }}
            />
          ) : (
            <Typography variant='baseMdBold' component='span'>
              {formatAmount(amountInUSD || '0', {
                minDecimals: 2,
                maxDecimals: 4,
              })}{' '}
              USDC
            </Typography>
          )}
        </Typography>
        <Box display='flex' alignItems='center'>
          <Typography variant='baseMd' component='p' fontWeight={400}>
            {t('general.slippage')}
          </Typography>
          <ToolTip
            title={t('modals.earningsCalculator.slippage-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
          <Typography variant='baseMd' component='p' ml='1ch'>
            {formatPercentage(ONE_INCH_SLIPPAGE)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default SwapInfo
