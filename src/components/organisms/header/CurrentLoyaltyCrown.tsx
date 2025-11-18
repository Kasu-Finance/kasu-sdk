'use client'

import { Box } from '@mui/material'
import Image from 'next/image'

import useLoyaltyLevel, { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import Crown_0 from '@/images/crown-0.png'
import Crown_1 from '@/images/crown-1.png'
import Crown_2 from '@/images/crown-2.png'

export const getCrown = (currentLevel: LoyaltyLevel) => {
  switch (currentLevel) {
    case 2:
      return Crown_2
    case 1:
      return Crown_1
    default:
      return Crown_0
  }
}

const CurrentLoyaltyCrown = () => {
  const { address } = usePrivyAuthenticated()

  const { stakedPercentage } = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  if (!address) return null

  return (
    <Box
      ml={1.5}
      component={Image}
      src={getCrown(currentLevel)}
      alt={`crown-level_${currentLevel}`}
      width={81}
      height={48}
    />
  )
}

export default CurrentLoyaltyCrown
