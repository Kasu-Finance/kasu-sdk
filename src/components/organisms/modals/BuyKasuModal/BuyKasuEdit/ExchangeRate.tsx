import { Box, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { formatAmount } from '@/utils'

const ExchangeRate = () => {
  const { t } = getTranslation()

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
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Box>
            <Typography variant='baseMdBold'>
              {formatAmount('0.00', {
                minDecimals: 2,
              })}{' '}
              KASU{' '}
            </Typography>
            =
            <Typography variant='baseMdBold'>
              {' '}
              {formatAmount('0.00', {
                minDecimals: 2,
              })}{' '}
              KASU{' '}
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
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Box>
            <Typography variant='baseMdBold'>
              {formatAmount('0.00', {
                minDecimals: 2,
              })}{' '}
              KASU{' '}
            </Typography>
            <Typography variant='baseMd' color='rgba(133, 87, 38, 1)'>
              {formatAmount('0.00', {
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

export default ExchangeRate
