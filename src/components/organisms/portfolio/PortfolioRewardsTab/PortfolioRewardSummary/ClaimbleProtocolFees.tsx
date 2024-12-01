'use client'

import { Skeleton, Typography } from '@mui/material'

import usePortfolioRewards from '@/hooks/portfolio/usePortfolioRewards'

import { formatAmount } from '@/utils'

const ClaimableProtocolFees = () => {
  const { isLoading, portfolioRewards } = usePortfolioRewards()

  if (isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  return (
    <Typography variant='baseMdBold'>
      {formatAmount(
        portfolioRewards?.protocolFees.claimableBalance.usdcAmount || '0',
        {
          minValue: 1_000_000,
          minDecimals: 2,
        }
      )}{' '}
      USDC
    </Typography>
  )
}

export default ClaimableProtocolFees
