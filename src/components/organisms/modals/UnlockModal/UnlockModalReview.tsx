import { Box, Grid, Typography } from '@mui/material'
import React from 'react'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

type UnlockModalReviewProps = {
  lockedAmount: string
  unlockAmount: string
}

const UnlockModalReview: React.FC<UnlockModalReviewProps> = ({
  lockedAmount,
  unlockAmount,
}) => {
  const { nextEpochTime } = useNextEpochTime()

  const { t } = useTranslation()

  return (
    <>
      <ColoredBox>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InfoColumn
              title={t('general.totalKsuLocked')}
              toolTipInfo={t('modals.unlock.overview.metric-1-tooltip')}
              showDivider
              titleStyle={{ textTransform: 'capitalize' }}
              metric={
                <TokenAmount
                  px={2}
                  amount={formatAmount(lockedAmount || '0')}
                  symbol='KSU'
                />
              }
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title={t('modals.unlock.withdraw.withdraw-metric-3')}
              toolTipInfo={t(
                'modals.unlock.withdraw.withdraw-metric-3-tooltip'
              )}
              showDivider
              metric={
                <TokenAmount
                  px={2}
                  amount={formatAmount(unlockAmount || '0')}
                  symbol='KSU'
                />
              }
            />
          </Grid>
        </Grid>
      </ColoredBox>

      <Box mt={2}>
        <InfoColumn
          title={t('modals.lock.reviewLock.epochEnds')}
          showDivider
          metric={
            <Box px={2} py='6px'>
              <Typography variant='h6' component='span' display='block'>
                <Countdown
                  endTime={nextEpochTime}
                  format='D:HH:mm'
                  render={(countDown) => {
                    const parts = countDown.split(':')

                    return `${parts[0]} ${t('time.days')} • ${parts[1]} ${t(
                      'time.hours'
                    )} • ${parts[2]} ${t('time.minutes')}`
                  }}
                />
              </Typography>
              <Typography
                variant='body1'
                component='span'
                color={(theme) => theme.palette.text.secondary}
              >
                {dayjs
                  .unix(nextEpochTime)
                  .format('DD.MM.YYYY • HH:mm:ss UTCZZ')}
              </Typography>
            </Box>
          }
        />
      </Box>
      <Typography
        variant='body2'
        component='p'
        mt={2}
        mx='auto'
        display='block'
        width='max-content'
      >
        {t('modals.unlock.reviewLock.unlockingSchedule')}
      </Typography>
    </>
  )
}

export default UnlockModalReview
