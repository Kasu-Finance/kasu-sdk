'use client'

import { LockPeriod } from '@kasufinance/kasu-sdk'
import { Grid } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'

import { ModalsKeys } from '@/context/modal/modal.types'

type UserLoyaltyActionsProps = {
  lockPeriods: LockPeriod[]
}

const UserLoyaltyActions: React.FC<UserLoyaltyActionsProps> = ({
  lockPeriods,
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleLockKSU = () => openModal({ name: ModalsKeys.LOCK, lockPeriods })
  const handleBuyKSU = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <Grid container columnSpacing={4} justifyContent='center' mt={4}>
      <Grid item>
        <AuthenticateButton
          onAuthenticated={handleLockKSU}
          variant='outlined'
          sx={{ width: 368 }}
        >
          {t('general.lockKSU')}
        </AuthenticateButton>
      </Grid>
      <Grid item>
        <AuthenticateButton
          onAuthenticated={handleBuyKSU}
          variant='outlined'
          sx={{ width: 368 }}
        >
          {t('general.buyKSU')}
        </AuthenticateButton>
      </Grid>
    </Grid>
  )
}

export default UserLoyaltyActions
