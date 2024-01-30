import { Box, Typography } from '@mui/material'
import React from 'react'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'

type LockModalConfirmationProps = {
  lockAmount: string
}

const LockModalConfirmation: React.FC<LockModalConfirmationProps> = ({
  lockAmount,
}) => {
  const { nextEpochTime } = useNextEpochTime()

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
          >
            To
          </Typography>
          <Typography variant='h6' component='span' display='block'>
            Cash management pool
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
            Lock Amount
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
          Epoch ends in
        </Typography>
        <Typography variant='h6' component='span' display='block'>
          <Countdown
            endTime={nextEpochTime ?? 0}
            format='D:HH:mm'
            render={(countDown) => {
              const parts = countDown.split(':')

              return `${parts[0]} days • ${parts[1]} hours • ${parts[2]} minutes`
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
        Deposit will be scheduled to the end of the current epoch.
      </Typography>
      <Typography
        variant='body1'
        component='p'
        mt={2}
        mx='auto'
        display='block'
        width='max-content'
      >
        Next clearing day commences in{' '}
        <Typography variant='h6' component='span'>
          6 days 11 hours 6 minutes.
        </Typography>
      </Typography>
    </>
  )
}

export default LockModalConfirmation
