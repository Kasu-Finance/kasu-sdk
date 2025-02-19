'use client'

import { Skeleton, Typography } from '@mui/material'

import useLockingRewards from '@/hooks/locking/useLockingRewards'

import { formatAmount } from '@/utils'

const ClaimableFeesBalance = () => {
  const { lockingRewards, isLoading } = useLockingRewards()

  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(lockingRewards?.claimableRewards || '0', {
        minDecimals: 2,
      })}{' '}
      USDC
    </Typography>
  )
}

export default ClaimableFeesBalance
