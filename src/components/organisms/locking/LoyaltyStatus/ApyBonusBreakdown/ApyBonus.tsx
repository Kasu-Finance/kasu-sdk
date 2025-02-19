'use client'

import { Skeleton, Typography } from '@mui/material'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

const ApyBonus = () => {
  const { stakedPercentage, isLoading } = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {currentLevel === 1 ? '0.10 %' : currentLevel === 2 ? '0.20 %' : '0.00 %'}
    </Typography>
  )
}

export default ApyBonus
