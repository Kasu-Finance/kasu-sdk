'use client'

import { Skeleton, Typography, TypographyProps } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import React from 'react'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'

const UsdcBalance: React.FC<TypographyProps> = (props) => {
  const supportedToken = useSupportedTokenInfo()

  const { balance, decimals, isUserBalanceLoading } = useUserBalance(
    supportedToken?.[SupportedTokens.USDC].address
  )

  if (isUserBalanceLoading) {
    return <Skeleton variant='rounded' width={150} height={24} />
  }

  return (
    <Typography variant='baseMdBold' {...props}>
      {formatAmount(formatUnits(balance, decimals), { minDecimals: 2 })} USDC
    </Typography>
  )
}

export default UsdcBalance
