import { Box, Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'

import { formatTimestamp } from '@/utils'

const WithdrawCountdown = () => {
  const { t } = useTranslation()
  const { nextEpochTime } = useNextEpochTime()

  const formattedTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box mt={0.5}>
      <Typography variant='h6' component='span' display='block'>
        <Countdown
          endTime={nextEpochTime}
          format='D:HH:mm'
          render={(countDown) => {
            const [days, hours, minutes] = countDown.split(':')
            return `${days} ${t('time.days')} • ${hours} ${t(
              'time.hours'
            )} • ${minutes} ${t('time.minutes')}`
          }}
        />
      </Typography>
      <Typography variant='body1' color='grey.500'>
        {formattedTime.date} • {formattedTime.timestamp}{' '}
        <Typography variant='caption' color='inherit' component='span'>
          {formattedTime.utcOffset}
        </Typography>
      </Typography>
    </Box>
  )
}

export default WithdrawCountdown
