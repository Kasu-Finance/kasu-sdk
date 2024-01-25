'use client'

import { Button, Divider, Typography } from '@mui/material'
import { Fragment } from 'react'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import RewardRow from '@/components/atoms/locking/RewardRow'

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
          <Fragment key={reward.title}>
            {index !== 0 && <Divider />}
            <RewardRow {...reward} />
          </Fragment>
        ))}
      </ColoredBox>
    </CardWidget>
  )
}

export default RewardsOverview
