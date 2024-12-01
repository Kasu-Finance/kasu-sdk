'use client'

import { Box, Skeleton, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import useUserBonusData from '@/hooks/locking/useUserBonusData'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const KsuBonusAndRewards = () => {
  const { userBonus, isLoading } = useUserBonusData()

  const { ksuPrice } = useKsuPrice()

  if (isLoading) {
    return <Skeleton variant='rounded' width={150} height={24} />
  }

  const totalKsuBonusAndRewards = userBonus
    ? userBonus.ksuBonusAndRewards
    : '0.00'

  const rewardsInUSD = convertToUSD(
    toBigNumber(totalKsuBonusAndRewards || '0'),
    toBigNumber(ksuPrice || '0')
  )

  return (
    <Box>
      <Typography variant='baseMdBold' mr='1ch'>
        {formatAmount(totalKsuBonusAndRewards, {
          minDecimals: 2,
        })}{' '}
        KSU
      </Typography>
      <Typography variant='baseMd' color='gray.middle'>
        {formatAmount(formatEther(rewardsInUSD || '0'))} USDC
      </Typography>
    </Box>
  )
}

export default KsuBonusAndRewards
