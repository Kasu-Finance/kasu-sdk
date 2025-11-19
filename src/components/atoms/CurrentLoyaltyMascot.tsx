'use client'

import Image, { ImageProps } from 'next/image'
import React from 'react'

import useLoyaltyLevel, { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import Cat_0 from '@/images/crowned-cat-0.png'
import Cat_1 from '@/images/crowned-cat-1.png'
import Cat_2 from '@/images/crowned-cat-2.png'
import Cat from '@/images/crownless-cat.png'

const getMascot = (currentLevel: LoyaltyLevel) => {
  switch (currentLevel) {
    case 2:
      return Cat_2
    case 1:
      return Cat_1
    case 0:
      return Cat_0
    default:
      return Cat
  }
}

const CurrentLoyaltyMascot: React.FC<Omit<ImageProps, 'src' | 'alt'>> = (
  props
) => {
  const { stakedPercentage } = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  return (
    <Image
      src={getMascot(currentLevel)}
      alt={`cat-level_${currentLevel}`}
      width={367}
      height={315}
      priority
      {...props}
    />
  )
}

export default CurrentLoyaltyMascot
