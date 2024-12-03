import { Box, Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import { formatTimestamp } from '@/utils'

const WithdrawalScheduleInfo = () => {
  const { t } = getTranslation()

  const { nextEpochTime } = useNextEpochTime()

  const formattedTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
      <Typography variant='baseSm' color='white' component='p'>
        {t('lending.withdraw.withdrawalSchedule-1')} <br />
        {t('lending.withdraw.withdrawalSchedule-2')}
      </Typography>

      <Typography variant='baseMd' mt={2} display='block'>
        {t('lending.withdraw.epochEnds')}
        <Typography variant='baseMdBold' ml='1ch'>
          {formattedTime.date} • {formattedTime.timestamp}{' '}
          {formattedTime.utcOffset}
        </Typography>
      </Typography>
    </Box>
  )
}

export default WithdrawalScheduleInfo
