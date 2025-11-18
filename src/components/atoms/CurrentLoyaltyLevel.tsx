'use client'

import { Typography, TypographyProps } from '@mui/material'
import React from 'react'

import useLoyaltyLevel, {
  LoyalLoyaltyLevels,
} from '@/hooks/locking/useLoyaltyLevel'
import getTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

const CurrentLoyaltyLevel: React.FC<TypographyProps> = (props) => {
  const { t } = getTranslation()

  const { stakedPercentage } = useLockingPercentage()

  const { currentLevel, isLoyal } = useLoyaltyLevel(stakedPercentage)

  return (
    <Typography variant='h4' {...props}>
      {currentLevel >= 0
        ? t(
            `locking.widgets.loyalty.level.level-${isLoyal ? (currentLevel as LoyalLoyaltyLevels) : 0}.title`
          )
        : 'No Loyalty Level'}
    </Typography>
  )
}

export default CurrentLoyaltyLevel
