'use client'

import { Skeleton, Typography } from '@mui/material'

import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'

import { formatAmount } from '@/utils'

const RKsuAmount = () => {
  const { rKsuAmount, isLoading } = useEarnedRKsu()

  if (isLoading) {
    return <Skeleton variant='rounded' width={80} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(rKsuAmount || '0', { minDecimals: 2 })} rKSU
    </Typography>
  )
}

export default RKsuAmount
