'use client'

import { Box, Divider, Typography } from '@mui/material'
import { Fragment } from 'react'

import ColoredBox from '@/components/atoms/ColoredBox'
import EpochRow from '@/components/atoms/locking/EpochRow'

const EPOCHS = [
  {
    title: 'Your next rewards',
    amount: '820.00',
    info: 'info',
  },
  {
    title: 'KASU per rKSU',
    subtitle: '(next epoch)',
    amount: '100.21',
    info: 'info',
  },
]

const EpochOverview = () => {
  return (
    <>
      <Typography variant='h6' component='span' mt={1} mb={2} display='block'>
        Epoch
      </Typography>
      <Box py={2}>
        <Typography
          variant='subtitle2'
          component='span'
          color='text.secondary'
          my='6px'
          mx={2}
          display='block'
        >
          Next xKASU epoch
        </Typography>
        <Typography variant='h6' component='span' mx={2} display='block'>
          2 days • 3 hours • 2 minutes
        </Typography>
        <ColoredBox mt={1}>
          {' '}
          {EPOCHS.map((epoch, index) => (
            <Fragment key={epoch.title}>
              {index !== 0 && <Divider />}
              <EpochRow {...epoch} />
            </Fragment>
          ))}
        </ColoredBox>
      </Box>
    </>
  )
}

export default EpochOverview
