import { Box, Divider, Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'

import dayjs from '@/dayjs'

const EpochCountdown = () => {
  const { t } = useTranslation()

  const { nextEpochTime } = useNextEpochTime()

  return (
    <Box>
      <Typography
        p={(theme) => theme.spacing('6px', 2)}
        variant='subtitle2'
        component='span'
        display='block'
      >
        {t('locking.widgets.totalRewards.metric-1')}
      </Typography>
      <Divider />
      <Typography
        p={(theme) => theme.spacing('6px', 2)}
        variant='h6'
        component='span'
        display='block'
      >
        <Countdown
          endTime={nextEpochTime ?? 0}
          format='D:HH:mm'
          render={(countDown) => {
            const parts = countDown.split(':')

            return `${parts[0]} ${t('time.days')} • ${parts[1]} ${t(
              'time.hours'
            )} • ${parts[2]} ${t('time.minutes')}`
          }}
        />
        <br />
        <Typography
          variant='body1'
          component='span'
          color={(theme) => theme.palette.text.secondary}
        >
          {dayjs.unix(nextEpochTime ?? 0).format('DD.MM.YYYY UTCZZ')}
        </Typography>
      </Typography>
    </Box>
  )
}

export default EpochCountdown
