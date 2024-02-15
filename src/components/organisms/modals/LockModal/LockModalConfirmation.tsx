import { Box, Typography } from '@mui/material'
import React from 'react'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'

type LockModalConfirmationProps = {
  lockAmount: string
}

const LockModalConfirmation: React.FC<LockModalConfirmationProps> = ({
  lockAmount,
}) => {
  const { nextEpochTime } = useNextEpochTime()
  const { t } = useTranslation()

  return (
    <>
      <ColoredBox
        display='grid'
        gridTemplateColumns='repeat(2, minmax(0, 1fr))'
      >
        <Box px={2}>
          <Typography
            variant='subtitle2'
            component='span'
            color='text.secondary'
            display='block'
            my='6px'
            sx={{ textTransform: 'capitalize' }}
          >
            {t('general.to')}
          </Typography>
          <Typography variant='h6' component='span' display='block'>
            {t('modals.lock.reviewLock.cashPool')}
          </Typography>
        </Box>
        <Box px={2}>
          <Typography
            variant='subtitle2'
            component='span'
            color='text.secondary'
            display='block'
            my='6px'
          >
            {t('modals.lock.reviewLock.lockAmount')}
          </Typography>
          <Typography variant='h6' component='span' display='block'>
            {lockAmount} USDC
          </Typography>
        </Box>
      </ColoredBox>
      <Box px={2} mt={2} display='flex' flexDirection='column'>
        <Typography
          variant='subtitle2'
          component='span'
          color='text.secondary'
          display='block'
          my='6px'
        >
          {t('modals.lock.reviewLock.epochEnds')}
        </Typography>
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
      <Typography
        variant='body1'
        component='p'
        mt={2}
        mx='auto'
        display='block'
        width='max-content'
      >
        {t('modals.lock.reviewLock.nextClearing') + ' '}
        <Typography variant='h6' component='span'>
          {`6 ${t('time.days')} • 11 ${t('time.hours')} • 6 ${t(
            'time.minutes'
          )} `}
        </Typography>
      </Typography>
    </>
  )
}

export default LockModalConfirmation
