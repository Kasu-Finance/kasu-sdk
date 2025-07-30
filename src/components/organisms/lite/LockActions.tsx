'use client'

import { Button, Grid2, Stack } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

const LockActions = () => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

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
        onClick={handleOpen}
        sx={{ width: 'max-content', textTransform: 'capitalize' }}
      >
        {t('lite.buyAndLock.actions.unlock')}
      </Button>
      <Grid2 container spacing={2}>
        <Grid2 size={6}>
          <Button
            variant='outlined'
            onClick={handleOpen}
            sx={{ textTransform: 'capitalize' }}
            fullWidth
          >
            {t('lite.buyAndLock.actions.buy')}
          </Button>
        </Grid2>
        <Grid2 size={6}>
          <Button
            variant='contained'
            onClick={handleOpen}
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
