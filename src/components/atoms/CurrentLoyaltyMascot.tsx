'use client'

import Image from 'next/image'

import useLoyaltyLevel, { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import Cat_0 from '@/images/crowned-cat-0.png'
import Cat_1 from '@/images/crowned-cat-1.png'
import Cat_2 from '@/images/crowned-cat-2.png'

const getMascot = (currentLevel: LoyaltyLevel) => {
  switch (currentLevel) {
    case 2:
      return Cat_2
    case 1:
      return Cat_1
    default:
      return Cat_0
  }
}

const CurrentLoyaltyMascot = () => {
  const { stakedPercentage } = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  return (
    <Image
      src={getMascot(currentLevel)}
      alt={`cat-level_${currentLevel}`}
      width={367}
      height={315}
    />
  )
}

export default CurrentLoyaltyMascot
