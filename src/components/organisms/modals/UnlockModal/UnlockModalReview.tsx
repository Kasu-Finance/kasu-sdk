import { Box, Grid, Typography } from '@mui/material'
import React from 'react'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import dayjs from '@/dayjs'

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
              title='Total KSU Locked'
              toolTipInfo='info'
              showDivider
              metric={<TokenAmount px={2} amount={lockedAmount} symbol='KSU' />}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title='Available KSU to Unlock'
              toolTipInfo='info'
              showDivider
              metric={<TokenAmount px={2} amount={unlockAmount} symbol='KSU' />}
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
              <Typography
                variant='body1'
                component='span'
                color={(theme) => theme.palette.text.secondary}
              >
                {dayjs
                  .unix(nextEpochTime ?? 0)
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
