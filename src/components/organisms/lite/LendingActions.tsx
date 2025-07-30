'use client'

import { Button, Grid2 } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

const LendingActions = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={6}>
        <Button
          variant='outlined'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
          onClick={handleOpen}
        >
          Withdraw
        </Button>
      </Grid2>
      <Grid2 size={6}>
        <Button
          variant='contained'
          fullWidth
          sx={{ textTransform: 'capitalize' }}
          onClick={handleOpen}
        >
          Lend
        </Button>
      </Grid2>
    </Grid2>
  )
}

export default LendingActions
