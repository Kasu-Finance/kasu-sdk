'use client'

import { Box, Skeleton, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import usePortfolioRewards from '@/hooks/portfolio/usePortfolioRewards'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LifetimeKsuBonusRewards = () => {
  const { isLoading, portfolioRewards } = usePortfolioRewards()

  const { ksuPrice, isLoading: isKsuPriceLoading } = useKsuPrice()

  if (isLoading && isKsuPriceLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  const ksuInUSD = convertToUSD(
    portfolioRewards?.totalLifetimeKsuRewards ?? toBigNumber('0'),
    toBigNumber(ksuPrice || '0')
  )

  return (
    <Box>
      <Typography variant='baseMdBold' mr='1ch'>
        {formatAmount(
          formatEther(portfolioRewards?.totalLifetimeKsuRewards || '0'),
          {
            minValue: 1_000_000,
            minDecimals: 2,
          }
        )}{' '}
        KASU
      </Typography>
      <Typography variant='baseMd' color='gray.middle'>
        {formatAmount(formatEther(ksuInUSD) || '0')} USDC
      </Typography>
    </Box>
  )
}

export default LifetimeKsuBonusRewards
