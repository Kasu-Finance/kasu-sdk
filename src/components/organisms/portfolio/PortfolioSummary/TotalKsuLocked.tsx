'use client'

import { Box, Skeleton, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { formatEther, parseEther } from 'ethers/lib/utils'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import TokenAmount from '@/components/atoms/TokenAmount'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type TotalKsuLockedProps = {
  currentEpoch: string
  poolOverviews: PoolOverview[]
}

const TotalKsuLocked: React.FC<TotalKsuLockedProps> = ({
  currentEpoch,
  poolOverviews,
}) => {
  const { portfolioSummary, isLoading } = usePortfolioSummary(
    currentEpoch,
    poolOverviews
  )

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
        symbol='KSU'
      />
      <Typography variant='baseMd' color='gray.middle' ml='1ch'>
        ({formatAmount(formatEther(ksuInUSD))} USDC)
      </Typography>
    </Box>
  )
}

export default TotalKsuLocked
