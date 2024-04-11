import { Box, Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'

import { extractDateAndUtcOffset, formatTimestampWithOffset } from '@/utils'

const WithdrawCountdown = () => {
  const { t } = useTranslation()
  const { nextEpochTime = 0 } = useNextEpochTime()

  const formattedDate = formatTimestampWithOffset(nextEpochTime, 1)
  const { date, time, format, offset } = extractDateAndUtcOffset(formattedDate)

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

      {date && time && (
        <Typography variant='body1' color='grey.500'>
          {date} • {time}{' '}
          <span style={{ fontSize: '0.75rem' }}>
            {format}
            {offset}
          </span>
        </Typography>
      )}
    </Box>
  )
}

export default WithdrawCountdown
