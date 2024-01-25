'use client'

import { Button, Typography } from '@mui/material'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

const REWARDS = [
  {
    title: 'Your claimable locking rewards',
    amount: '8.27',
    info: 'info',
  },
  {
    title: 'Your lifetime locking rewards',
    amount: '1250.00',
    info: 'info',
  },
]

const RewardsOverview = () => {
  return (
    <CardWidget
      title='Locking Rewards'
      cardAction={<Button variant='contained'>Claim Rewards</Button>}
    >
      <Typography
        variant='subtitle2'
        component='span'
        color='text.secondary'
        mx={1}
        my='6px'
        display='block'
      >
        Your claimable rewards
      </Typography>
      <Typography variant='h6' component='span' mx={1} my='6px' display='block'>
        0.00 USDC
      </Typography>

      <ColoredBox mt={1}>
        {REWARDS.map((reward, index) => (
          <InfoRow
            key={reward.title}
            showDivider={index !== REWARDS.length - 1}
            {...reward}
            metricInfo={reward.amount + ' USDC'}
          />
        ))}
      </ColoredBox>
    </CardWidget>
  )
}

export default RewardsOverview
