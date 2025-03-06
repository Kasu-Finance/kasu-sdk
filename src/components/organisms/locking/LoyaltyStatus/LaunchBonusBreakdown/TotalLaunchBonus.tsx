'use client'

import { Skeleton, Typography } from '@mui/material'

import useEarnedBonusLockingAmount from '@/hooks/locking/useEarnedBonusLockingAmount'

import { formatAmount } from '@/utils'

const TotalLaunchBonus = () => {
  const { totalLaunchBonus, isLoading } = useEarnedBonusLockingAmount()

  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(totalLaunchBonus || '0', { minDecimals: 2 })} KASU
    </Typography>
  )
}

export default TotalLaunchBonus
