'use client'

import { Skeleton, Typography } from '@mui/material'

import useLockingRewards from '@/hooks/locking/useLockingRewards'

import { formatAmount } from '@/utils'

const LifetimeFeesEarned = () => {
  const { lockingRewards, isLoading } = useLockingRewards()

  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(lockingRewards?.lifeTimeRewards || '0', {
        minDecimals: 2,
      })}{' '}
      USDC
    </Typography>
  )
}

export default LifetimeFeesEarned
