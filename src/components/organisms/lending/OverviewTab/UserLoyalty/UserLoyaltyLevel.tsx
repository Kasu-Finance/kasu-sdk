'use client'

import { Typography } from '@mui/material'

import useLoyaltyLevel, {
  LoyalLoyaltyLevels,
} from '@/hooks/locking/useLoyaltyLevel'
import getTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

const UserLoyaltyLevel = () => {
  const { t } = getTranslation()

  const { stakedPercentage } = useLockingPercentage()
  const { currentLevel, isLoyal } = useLoyaltyLevel(stakedPercentage)

  return (
    <Typography variant='h4' textAlign='center'>
      {t(
        `locking.widgets.loyalty.level.level-${isLoyal ? (currentLevel as LoyalLoyaltyLevels) : 0}.title`
      )}
    </Typography>
  )
}

export default UserLoyaltyLevel
