'use client'

import { Button, Typography } from '@mui/material'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useLockingRewards from '@/hooks/locking/useLockingRewards'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

import { formatAmount } from '@/utils'

const REWARDS = (lockingRewards: {
  claimableRewards: string
  lifeTimeRewards: string
}) => [
  {
    title: 'Your claimable locking rewards',
    amount: formatAmount(lockingRewards.claimableRewards, { minDecimals: 2 }),
    toolTipInfo:
      'The amount KSU rewards that can be claimed upon the conclusion of the current Epoch.​',
  },
  {
    title: 'Your lifetime locking rewards',
    amount: formatAmount(lockingRewards.lifeTimeRewards, { minDecimals: 2 }),
    toolTipInfo: 'info',
  },
]

const RewardsOverview = () => {
  const { lockingRewards, isLoading } = useLockingRewards()

  const claimRewards = useClaimLockingRewards()

  return (
    <CardWidget
      title='Locking Rewards'
      cardAction={
        <Button sx={{ width: 168 }} onClick={claimRewards} variant='contained'>
          Claim Rewards
        </Button>
      }
    >
      <Typography variant='h6' component='span' mx={1} my='6px' display='block'>
        0.00 USDC
      </Typography>
      {isLoading ? null : lockingRewards ? (
        <ColoredBox mt={1}>
          {REWARDS(lockingRewards).map((reward, index) => (
            <InfoRow
              key={reward.title}
              showDivider={index !== REWARDS.length}
              metric={reward.amount + ' USDC'}
              {...reward}
            />
          ))}
        </ColoredBox>
      ) : null}
    </CardWidget>
  )
}

export default RewardsOverview
