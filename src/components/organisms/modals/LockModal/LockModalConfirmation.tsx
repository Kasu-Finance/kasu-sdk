import { Box, Typography } from '@mui/material'

import ColoredBox from '@/components/atoms/ColoredBox'

const LockModalConfirmation = () => {
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
            1000.00 USDC
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
          2 days • 3 hours • 2 minutes
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
