'use client'

import { Button, Grid } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

const UserLoyaltyActions = () => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const handleLockKSU = () => openModal({ name: ModalsKeys.LOCK })

  return (
    <Grid container columnSpacing={4} justifyContent='center' mt={4}>
      <Grid item>
        <Button onClick={handleLockKSU} variant='outlined' sx={{ width: 368 }}>
          {t('general.lockKSU')}
        </Button>
      </Grid>
      <Grid item>
        <Button
          href='https://www.google.com'
          target='_blank'
          variant='outlined'
          sx={{ width: 368 }}
        >
          {t('general.buyKSU')}
        </Button>
      </Grid>
    </Grid>
  )
}

export default UserLoyaltyActions
