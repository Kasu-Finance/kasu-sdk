import { Box, Skeleton, Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import { formatTimestamp } from '@/utils'

const EpochEndInfo = () => {
  const { t } = getTranslation()

  const { nextEpochTime, isLoading } = useNextEpochTime()

  const formattedNextEpochTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
      <Typography variant='baseMd' display='inline-flex' alignItems='center'>
        {t('modals.cancelWithdrawal.epochEnds')}
        {isLoading ? (
          <Skeleton
            variant='rounded'
            sx={{
              bgcolor: 'gold.extraDark',
              display: 'inline-block',
              ml: '1ch',
            }}
            width={200}
            height={21}
          />
        ) : (
          <Typography variant='baseMdBold' display='inline' ml='1ch'>
            {formattedNextEpochTime.date} •{' '}
            <Typography
              variant='inherit'
              color='rgba(133, 87, 38, 1)'
              display='inline'
            >
              {formattedNextEpochTime.timestamp}{' '}
              {formattedNextEpochTime.utcOffset}
            </Typography>
          </Typography>
        )}
      </Typography>
    </Box>
  )
}

export default EpochEndInfo
