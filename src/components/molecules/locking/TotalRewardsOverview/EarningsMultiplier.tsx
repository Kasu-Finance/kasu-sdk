import { Box, Divider, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import LockPeriodInfo from '@/components/molecules/LockPeriodInfo'

const EarningsMultiplier = () => {
  const { t } = useTranslation()

  return (
    <ColoredBox>
      <Box p={[1, 2]} mb={1}>
        <Typography variant='subtitle1' component='span' display='block'>
          {t('locking.widgets.totalRewards.rewards-1.title')}
        </Typography>
      </Box>
      <InfoRow
        title={t('locking.widgets.totalRewards.rewards-1.metric-1')}
        toolTipInfo='info'
        metric={
          <Typography
            variant='h6'
            component='span'
            color={(theme) => theme.palette.text.disabled}
          >
            0 {t('time.days')}
          </Typography>
        }
      />
      <Divider />
      <InfoRow
        title={t('locking.widgets.totalRewards.rewards-1.metric-2')}
        toolTipInfo='info'
        metric={
          <Typography
            variant='h6'
            component='span'
            color={(theme) => theme.palette.text.disabled}
          >
            0.00 ✕
          </Typography>
        }
      />
      <Divider />
      <LockPeriodInfo />
    </ColoredBox>
  )
}

export default EarningsMultiplier
