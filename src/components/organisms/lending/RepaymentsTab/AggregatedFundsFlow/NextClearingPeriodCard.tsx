'use client'

import { Box, Skeleton, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'
import useNextClearingPeriod from '@/hooks/web3/useNextClearingPeriod'

import Countdown from '@/components/atoms/Countdown'
import InfoColumn from '@/components/atoms/InfoColumn'
import WaveBox from '@/components/atoms/WaveBox'

import { formatTimestamp } from '@/utils'

const NextClearingPeriodCard = () => {
  const { t } = getTranslation()
  const { nextClearingPeriod, isLoading } = useNextClearingPeriod()

  const formattedTime = formatTimestamp(nextClearingPeriod, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <WaveBox borderRadius={2} py={4} px={2} height={116}>
      <InfoColumn
        title={t('general.nextClearingPeriodStart')}
        metric={
          isLoading ? (
            <Box display='flex' gap='1ch' alignItems='end'>
              <Skeleton width='45%' height={50} />
              <Skeleton width='40%' height={30} />
            </Box>
          ) : (
            <Box>
              <Typography variant='h4' color='primary.main' display='inline'>
                <Countdown
                  endTime={nextClearingPeriod}
                  format='D:HH:mm'
                  render={(countDown) => {
                    const [days, hours, minutes] = countDown.split(':')
                    return `${days} ${t('time.days')} • ${hours} ${t(
                      'time.hours'
                    )} • ${minutes} ${t('time.minutes')}`
                  }}
                />
              </Typography>
              <Typography variant='baseMd' ml='1ch'>
                {formattedTime.date} • {formattedTime.timestamp}{' '}
                {formattedTime.utcOffset}
              </Typography>
            </Box>
          )
        }
      />
    </WaveBox>
  )
}

export default NextClearingPeriodCard
