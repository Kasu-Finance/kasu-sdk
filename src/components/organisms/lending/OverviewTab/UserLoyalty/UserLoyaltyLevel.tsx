'use client'

import { Typography } from '@mui/material'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

const UserLoyaltyLevel = () => {
  const { t } = useTranslation()

  const { stakedPercentage } = useLockingPercentage()
  const { currentLevel, isLoyal } = useLoyaltyLevel(stakedPercentage)

  return (
    <Typography variant='h4' textAlign='center'>
      {t(
        `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.title`
      )}
    </Typography>
  )
}

export default UserLoyaltyLevel
