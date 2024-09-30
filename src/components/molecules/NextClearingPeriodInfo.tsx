import { Box, Skeleton, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'
import useNextClearingPeriod from '@/hooks/web3/useNextClearingPeriod'

import { formatTimestamp } from '@/utils'

const NextClearingPeriodInfo = () => {
  const { t } = useTranslation()

  const { nextClearingPeriod, isLoading } = useNextClearingPeriod()

  const formattedNextClearingPeriod = formatTimestamp(nextClearingPeriod, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
      <Typography variant='baseMd' display='inline-flex' alignItems='center'>
        {t('general.nextClearingPeriodStart')}{' '}
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
            {formattedNextClearingPeriod.date} •{' '}
            <Typography
              variant='inherit'
              color='rgba(133, 87, 38, 1)'
              display='inline'
            >
              {formattedNextClearingPeriod.timestamp}{' '}
              {formattedNextClearingPeriod.utcOffset}
            </Typography>
          </Typography>
        )}
      </Typography>
    </Box>
  )
}

export default NextClearingPeriodInfo
