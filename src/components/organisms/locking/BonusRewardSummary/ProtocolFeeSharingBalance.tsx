'use client'

import { Skeleton, Typography } from '@mui/material'

import useUserBonusData from '@/hooks/locking/useUserBonusData'

import { formatAmount } from '@/utils'

const ProtocolFeeSharingBalance = () => {
  const { userBonus, isLoading } = useUserBonusData()

  if (isLoading) {
    return <Skeleton variant='rounded' width={100} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(userBonus?.protocolFeesEarned || '0', {
        minDecimals: 2,
      })}{' '}
      USDC
    </Typography>
  )
}

export default ProtocolFeeSharingBalance
