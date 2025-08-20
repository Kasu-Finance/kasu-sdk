'use client'

import { Button, Grid2, Stack } from '@mui/material'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import useUserLocks from '@/hooks/locking/useUserLocks'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

type LockActionsProps = {
  lockPeriods: LockPeriod[]
}

const LockActions: React.FC<LockActionsProps> = ({ lockPeriods }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const { userLocks, isLoading } = useUserLocks()

  const handleUnlockClick = () => {
    if (!userLocks) return

    openModal({
      name: ModalsKeys.UNLOCK,
      userLocks,
      userLock: userLocks[0],
    })
  }

  const handleLockClick = () =>
    openModal({ name: ModalsKeys.LOCK, lockPeriods })

  return (
    <Stack
      spacing={3}
      sx={{
        '& > .MuiButton-root': {
          ml: -1,
        },
      }}
    >
      <Button
        variant='text'
        onClick={handleUnlockClick}
        sx={{
          width: 'max-content',
          textTransform: 'capitalize',
          visibility: userLocks?.length ? 'visible' : 'hidden',
        }}
        disabled={isLoading || !userLocks}
      >
        {t('lite.buyAndLock.actions.unlock')}
      </Button>
      <Grid2 container spacing={2}>
        <Grid2 size={6}>
          <Button
            variant='outlined'
            onClick={handleUnlockClick}
            sx={{ textTransform: 'capitalize' }}
            fullWidth
          >
            {t('lite.buyAndLock.actions.buy')}
          </Button>
        </Grid2>
        <Grid2 size={6}>
          <Button
            variant='contained'
            onClick={handleLockClick}
            sx={{ textTransform: 'capitalize' }}
            fullWidth
          >
            {t('lite.buyAndLock.actions.lock')}
          </Button>
        </Grid2>
      </Grid2>
    </Stack>
  )
}
export default LockActions
