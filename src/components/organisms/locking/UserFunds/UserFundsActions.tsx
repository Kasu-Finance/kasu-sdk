'use client'

import { Button, Grid } from '@mui/material'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

type UserFundsActionsProps = {
  lockPeriods: LockPeriod[]
}

const UserFundsActions: React.FC<UserFundsActionsProps> = ({ lockPeriods }) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const handleLockKSU = () => openModal({ name: ModalsKeys.LOCK, lockPeriods })
  const handleBuyKSU = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <>
      <Grid item xs={6} textAlign='right'>
        <Button
          variant='outlined'
          fullWidth
          sx={{ maxWidth: 368, textTransform: 'capitalize' }}
          onClick={handleBuyKSU}
        >
          {t('general.buyKSU')}
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant='outlined'
          fullWidth
          sx={{ maxWidth: 368, textTransform: 'capitalize' }}
          onClick={handleLockKSU}
        >
          {t('general.lockKSU')}
        </Button>
      </Grid>
    </>
  )
}

export default UserFundsActions
