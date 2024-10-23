import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { customTypography } from '@/themes/typography'
import { formatAmount, formatTimestamp } from '@/utils'

const RequestOverview = () => {
  const { t } = useTranslation()

  const formattedTime = formatTimestamp(1729667263, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box>
      <InfoRow
        title={t('modals.requestDetails.metric-1')}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.requestDetails.metric-1-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formattedTime.date}{' '}
            <Typography
              variant='inherit'
              color='gold.extraDark'
              display='inline'
            >
              {formattedTime.timestamp} {formattedTime.utcOffset}
            </Typography>
          </Typography>
        }
      />
      <InfoRow
        title={t('modals.requestDetails.metric-2')}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.requestDetails.metric-2-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(10_000, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
      <InfoRow
        title={t('modals.requestDetails.metric-3')}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.requestDetails.metric-3-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(10_000, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
      <InfoRow
        title={t('modals.requestDetails.metric-4')}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.requestDetails.metric-4-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(10_000, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
      <InfoRow
        title={t('modals.requestDetails.metric-5')}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.requestDetails.metric-5-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(10_000, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
      <InfoRow
        title={t('modals.requestDetails.metric-6')}
        titleStyle={{ sx: { ...customTypography.baseMdBold } }}
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.requestDetails.metric-6-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography variant='h4'>
            {formatAmount(10_000, { minDecimals: 2 })} USDC
          </Typography>
        }
      />
    </Box>
  )
}

export default RequestOverview
