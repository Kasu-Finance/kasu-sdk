'use client'

import { Skeleton, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import useTotalLendingPoolDeposits from '@/hooks/web3/useTotalLendingPoolDeposits'

import { formatAmount, toBigNumber } from '@/utils'

const ActiveDepositAmount = () => {
  const { totalDeposits, isLoading } = useTotalLendingPoolDeposits()
  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  const totalLending = toBigNumber(
    totalDeposits.activeDepositAmount || '0'
  ).add(toBigNumber(totalDeposits.pendingDepositAmount || '0'))

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(formatEther(totalLending), {
        minDecimals: 2,
        minValue: 100_000,
      })}{' '}
      USDC
    </Typography>
  )
}

export default ActiveDepositAmount
