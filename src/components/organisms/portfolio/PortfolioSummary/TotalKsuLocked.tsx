'use client'

import { Box, Skeleton, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import usePortfolioSummaryContext from '@/hooks/context/usePortfolioSummaryContext'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import TokenAmount from '@/components/atoms/TokenAmount'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const TotalKsuLocked: React.FC = () => {
  const { portfolioSummary, isLoading } = usePortfolioSummaryContext()

  const { ksuPrice, isLoading: ksuPriceLoading } = useKsuPrice()

  if (isLoading && ksuPriceLoading) {
    return <Skeleton variant='rounded' width='80%' height={24} />
  }

  const ksuInUSD = convertToUSD(
    toBigNumber(portfolioSummary?.current.totalKsuLocked || '0'),
    parseEther(ksuPrice || '0')
  )

  return (
    <Box display='flex' alignItems='end'>
      <TokenAmount
        amount={formatAmount(portfolioSummary?.current.totalKsuLocked || '0', {
          minDecimals: 2,
        })}
        symbol='KASU'
      />
      <Typography variant='baseMd' color='gray.middle' ml='1ch'>
        ({formatAmount(formatEther(ksuInUSD))} USDC)
      </Typography>
    </Box>
  )
}

export default TotalKsuLocked
