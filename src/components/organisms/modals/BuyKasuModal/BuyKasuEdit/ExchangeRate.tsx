import { Box, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { memo } from 'react'

import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { formatAmount, toBigNumber } from '@/utils'

type ExchangeRateProps = {
  amountInUSD: string
}

const ExchangeRate: React.FC<ExchangeRateProps> = ({ amountInUSD }) => {
  const { t } = getTranslation()

  const { ksuPrice } = useKsuPrice()

  const purchaseAmount =
    ksuPrice && !toBigNumber(ksuPrice).isZero()
      ? toBigNumber(amountInUSD).mul(toBigNumber('1')).div(parseEther(ksuPrice))
      : '0'

  return (
    <Box>
      <InfoRow
        sx={{ pt: 0 }}
        title={`${t('modals.buyKasu.metric-1')}`}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={t('locking.widgets.overview.metric-1-tooltip')}
            iconSx={{
              color: 'gold.dark',
              '&:hover': {
                color: 'gold.extraDark',
              },
            }}
          />
        }
        metric={
          <Box>
            <Typography variant='baseMdBold'>
              {formatAmount(1, {
                minDecimals: 2,
              })}{' '}
              KASU{' '}
            </Typography>
            =
            <Typography variant='baseMdBold'>
              {' '}
              {formatAmount(ksuPrice || '0', {
                minDecimals: 2,
              })}{' '}
              USDC{' '}
            </Typography>
          </Box>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      <InfoRow
        title={`${t('modals.buyKasu.metric-2')}`}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={t('locking.widgets.overview.metric-1-tooltip')}
            iconSx={{
              color: 'gold.dark',
              '&:hover': {
                color: 'gold.extraDark',
              },
            }}
          />
        }
        metric={
          <Box>
            <Typography variant='baseMdBold'>
              {formatAmount(formatEther(purchaseAmount), {
                minDecimals: 2,
              })}{' '}
              KASU{' '}
            </Typography>
            <Typography variant='baseMd' color='rgba(133, 87, 38, 1)'>
              {formatAmount(amountInUSD, {
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          </Box>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
    </Box>
  )
}

export default memo(ExchangeRate)
