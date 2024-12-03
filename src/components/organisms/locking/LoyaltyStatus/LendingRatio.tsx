'use client'

import { Skeleton, Typography } from '@mui/material'

import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import { formatAmount } from '@/utils'

const LendingRatio = () => {
  const { stakedPercentage, isLoading } = useLockingPercentage()

  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(stakedPercentage || '0', { minDecimals: 2 })} %
    </Typography>
  )
}

export default LendingRatio
