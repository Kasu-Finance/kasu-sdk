'use client'

import { Box, Skeleton, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const RKsuAmount = () => {
  const { rKsuAmount, isLoading } = useEarnedRKsu()

  const { ksuPrice, isLoading: isKsuPriceLoading } = useKsuPrice()

  if (isLoading || isKsuPriceLoading) {
    return <Skeleton variant='rounded' width={80} height={24} />
  }

  const ksuInUSD = convertToUSD(
    toBigNumber(rKsuAmount || '0'),
    toBigNumber(ksuPrice || '0')
  )

  return (
    <Box>
      <Typography variant='baseMdBold'>
        {formatAmount(rKsuAmount || '0', { minDecimals: 2 })} rKASU{' '}
      </Typography>
      <Typography variant='baseMd' color='gray.middle'>
        {formatAmount(formatEther(ksuInUSD), { minDecimals: 2 })} USDC*
      </Typography>
    </Box>
  )
}

export default RKsuAmount
