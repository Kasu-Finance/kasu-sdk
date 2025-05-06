'use client'

import { Grid2 } from '@mui/material'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'

import { ModalsKeys } from '@/context/modal/modal.types'

type UserFundsActionsProps = {
  lockPeriods: LockPeriod[]
}

const UserFundsActions: React.FC<UserFundsActionsProps> = ({ lockPeriods }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleLockKSU = () => openModal({ name: ModalsKeys.LOCK, lockPeriods })
  const handleBuyKSU = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <Grid2 size={6} container spacing={2} alignItems='end'>
      <Grid2 size={6}>
        <AuthenticateButton
          variant='outlined'
          fullWidth
          sx={{ maxWidth: 368, textTransform: 'capitalize' }}
          onAuthenticated={handleBuyKSU}
        >
          {t('general.buyKSU')}
        </AuthenticateButton>
      </Grid2>
      <Grid2 size={6}>
        <AuthenticateButton
          variant='contained'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
          onAuthenticated={handleLockKSU}
        >
          {t('general.lockKSU')}
        </AuthenticateButton>
      </Grid2>
    </Grid2>
  )
}

export default UserFundsActions
