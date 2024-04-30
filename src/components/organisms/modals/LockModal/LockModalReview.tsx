import { Box, Grid, Typography } from '@mui/material'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { DATE_FORMAT, TIME_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

type LockModalReviewProps = {
  lockAmount: string
  selectedLockPeriod: LockPeriod
}

const LockModalReview: React.FC<LockModalReviewProps> = ({
  lockAmount,
  selectedLockPeriod,
}) => {
  const { nextEpochTime } = useNextEpochTime()
  const { t } = useTranslation()

  return (
    <>
      <ColoredBox>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InfoColumn
              title={`${t('general.to')} ${t('general.pool')}`}
              showDivider
              titleStyle={{ textTransform: 'capitalize' }}
              metric={
                <Typography
                  component='span'
                  variant='h6'
                  py='6px'
                  px={2}
                  display='block'
                >
                  {t('modals.lock.reviewLock.cashPool')}
                </Typography>
              }
            />
          </Grid>
          <Grid item container xs={6} spacing={2}>
            <Grid item xs={12}>
              <InfoColumn
                title={t('modals.lock.reviewLock.lockAmount')}
                toolTipInfo='info'
                showDivider
                metric={
                  <TokenAmount
                    px={2}
                    amount={formatAmount(lockAmount)}
                    symbol='KSU'
                  />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <InfoColumn
                title={t('modals.lock.reviewLock.lockingDuration')}
                toolTipInfo='info'
                showDivider
                metric={
                  <Typography
                    variant='h6'
                    component='span'
                    py='6px'
                    px={2}
                    display='block'
                  >
                    {selectedLockPeriod.lockPeriod} {t('time.days')}
                  </Typography>
                }
              />
            </Grid>
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
                  .format(`${DATE_FORMAT} • ${TIME_FORMAT}`)}
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
        {t('modals.lock.reviewLock.depositSchedule')}
      </Typography>
    </>
  )
}

export default LockModalReview
