'use client'

import { Skeleton, Typography } from '@mui/material'

import useTotalLendingPoolDeposits from '@/hooks/web3/useTotalLendingPoolDeposits'

import { formatAmount } from '@/utils'

const ActiveDepositAmount = () => {
  const { totalDeposits, isLoading } = useTotalLendingPoolDeposits()
  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(totalDeposits.activeDepositAmount || '0', {
        minDecimals: 2,
        minValue: 100_000,
      })}{' '}
      USDC
    </Typography>
  )
}

export default ActiveDepositAmount
