'use client'

import { LockPeriod } from '@kasufinance/kasu-sdk'
import { Button, Grid2, Stack } from '@mui/material'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import useUserLocks from '@/hooks/locking/useUserLocks'
import getTranslation from '@/hooks/useTranslation'

import BuyKasuCowSwap from '@/components/organisms/locking/BuyKasuCowSwap'

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
          ml: { xs: 0, md: -1 },
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
      <Grid2 container spacing={{ xs: 2, md: 2 }}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <BuyKasuCowSwap
            buttonProps={{
              variant: 'outlined',
              sx: { textTransform: 'capitalize' },
              fullWidth: true,
              children: t('lite.buyAndLock.actions.buy'),
            }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
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
