'use client'

import { Box, Skeleton, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import useStakedKSU from '@/hooks/locking/useStakedKSU'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const TotalKsuLocked = () => {
  const { stakedKSU, isLoading } = useStakedKSU()

  const { ksuPrice } = useKsuPrice()

  if (isLoading) {
    return <Skeleton variant='rounded' width={150} height={24} />
  }

  const ksuInUSD = convertToUSD(
    toBigNumber(stakedKSU || '0'),
    parseEther(ksuPrice || '0')
  )

  return (
    <Box>
      <Typography variant='baseMdBold' mr='1ch'>
        {formatAmount(stakedKSU || '0', {
          minDecimals: 2,
        })}{' '}
        KSU
      </Typography>
      <Typography variant='baseMd' color='gray.middle'>
        {formatAmount(formatEther(ksuInUSD), { minDecimals: 2 })} USDC
      </Typography>
    </Box>
  )
}

export default TotalKsuLocked
