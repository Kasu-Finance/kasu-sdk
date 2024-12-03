'use client'

import { Box, Skeleton, Typography } from '@mui/material'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'

import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useUserBalance from '@/hooks/web3/useUserBalance'

import sdkConfig from '@/config/sdk'
import { convertToUSD, formatAmount } from '@/utils'

const TotalKsuBalance = () => {
  const { balance, decimals, isUserBalanceLoading } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  const { ksuPrice, isLoading } = useKsuPrice()

  if (isUserBalanceLoading && isLoading) {
    return <Skeleton variant='rounded' width={60} height={24} />
  }

  const ksuInUSD = convertToUSD(balance, parseEther(ksuPrice || '0'))

  return (
    <Box>
      <Typography variant='baseMdBold' mr='1ch'>
        {formatAmount(formatUnits(balance, decimals), {
          minDecimals: 2,
        })}{' '}
        KSU
      </Typography>
      <Typography variant='baseMd' color='gray.middle'>
        {formatAmount(formatEther(ksuInUSD), {
          minDecimals: 2,
        })}{' '}
        USDC
      </Typography>
    </Box>
  )
}

export default TotalKsuBalance
