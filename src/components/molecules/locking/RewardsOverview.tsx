'use client'

import { Button, Typography } from '@mui/material'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

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
  const { t } = useTranslation()
  const claimRewards = useClaimLockingRewards()

  return (
    <CardWidget
      title='Locking Rewards'
      cardAction={
        <Button sx={{ width: 168 }} onClick={claimRewards} variant='contained'>
          {t('general.claim') + ' ' + t('general.rewards')}
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
              metricInfo={reward.amount + ' USDC'}
              {...reward}
            />
            // <Fragment key={reward.title}>
            //   {index !== 0 && <Divider />}
            //   <RewardRow {...reward} />
            // </Fragment>
          ))}
        </ColoredBox>
      ) : null}
    </CardWidget>
  )
}

export default RewardsOverview
