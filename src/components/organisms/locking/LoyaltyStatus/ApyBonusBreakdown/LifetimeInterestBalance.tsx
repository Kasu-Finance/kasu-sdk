'use client'

import { Skeleton, Typography } from '@mui/material'

import useUserApyBonus from '@/hooks/locking/useUserApyBonus'

import { formatAmount } from '@/utils'

const LifetimeInterestBalance = () => {
  const { apyBonus, isLoading } = useUserApyBonus()

  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(apyBonus?.lifetime || '0', { minDecimals: 2 })} KASU
    </Typography>
  )
}

export default LifetimeInterestBalance
