'use client'

import { Box, Button, Divider, Typography } from '@mui/material'
import { Fragment } from 'react'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useLockingRewards from '@/hooks/locking/useLockingRewards'

import ColoredBox from '@/components/atoms/ColoredBox'
import RewardRow from '@/components/atoms/locking/RewardRow'

const REWARDS = (lockingRewards: {
  claimableRewards: string
  lifeTimeRewards: string
}) => [
  {
    title: 'Your claimable locking rewards',
    amount: lockingRewards.claimableRewards,
    info: 'info',
  },
  {
    title: 'Your lifetime locking rewards',
    amount: lockingRewards.claimableRewards,
    info: 'info',
  },
]

const RewardsOverview = () => {
  const { lockingRewards, isLoading } = useLockingRewards()

  const claimRewards = useClaimLockingRewards()

  return (
    <>
      <Typography variant='h6' component='span' display='block' my={2}>
        Locking Rewards
      </Typography>
      <Box p={2}>
        <Box>
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
          <Typography
            variant='h6'
            component='span'
            mx={1}
            my='6px'
            display='block'
          >
            0.00 USDC
          </Typography>
        </Box>

        {isLoading ? null : lockingRewards ? (
          <ColoredBox mt={1}>
            {REWARDS(lockingRewards).map((reward, index) => (
              <Fragment key={reward.title}>
                {index !== 0 && <Divider />}
                <RewardRow {...reward} />
              </Fragment>
            ))}
          </ColoredBox>
        ) : null}
      </Box>
      <Button
        variant='contained'
        sx={{ width: 168, margin: '8px auto 0 auto', display: 'block' }}
        onClick={claimRewards}
      >
        Claim Rewards
      </Button>
    </>
  )
}

export default RewardsOverview
