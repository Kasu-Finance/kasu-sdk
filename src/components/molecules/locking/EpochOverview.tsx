'use client'

import { Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import InfoRow from '@/components/atoms/InfoRow'

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
  const { nextEpochTime } = useNextEpochTime()

  return (
    <CardWidget title='Epoch'>
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
        <Countdown
          endTime={nextEpochTime ?? 0}
          format='D:HH:mm'
          render={(countDown) => {
            const parts = countDown.split(':')

            return `${parts[0]} days • ${parts[1]} hours • ${parts[2]} minutes`
          }}
        />
      </Typography>
      <ColoredBox mt={1}>
        {EPOCHS.map((epoch, index) => (
          <InfoRow
            key={epoch.title}
            {...epoch}
            showDivider={index !== EPOCHS.length - 1}
            metricInfo={epoch.amount + ' KASU'}
          />
        ))}
      </ColoredBox>
    </CardWidget>
  )
}

export default EpochOverview
