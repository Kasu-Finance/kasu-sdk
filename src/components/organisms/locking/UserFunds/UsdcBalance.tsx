'use client'

import { Skeleton, Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'

import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'

const UsdcBalance = () => {
  const supportedToken = useSupportedTokenInfo()

  const { balance, decimals, isUserBalanceLoading } = useUserBalance(
    supportedToken?.[SupportedTokens.USDC].address
  )

  if (isUserBalanceLoading) {
    return <Skeleton variant='rounded' width={150} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(formatUnits(balance, decimals))} USDC
    </Typography>
  )
}

export default UsdcBalance
