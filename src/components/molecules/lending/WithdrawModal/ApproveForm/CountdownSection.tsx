import { Box, Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'

import { extractDateAndUtcOffset, formatTimestampWithOffset } from '@/utils'

const CountdownSection = () => {
  const { t } = useTranslation()

  const { nextEpochTime } = useNextEpochTime()

  const formattedDate = formatTimestampWithOffset(nextEpochTime || 0, 1)
  const { date, time, format, offset } = extractDateAndUtcOffset(formattedDate)

  return (
    <Box mt={0.5}>
      <Typography variant='h6' component='span' display='block'>
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
      </Typography>
      <Typography variant='body1' color='grey.500'>
        {date} • {time}{' '}
        <span style={{ fontSize: 12 }}>
          {format}
          {offset}
        </span>
      </Typography>
    </Box>
  )
}
export default CountdownSection
