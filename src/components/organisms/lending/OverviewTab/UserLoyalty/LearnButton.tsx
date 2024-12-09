'use client'

import { Button } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

const LearnButton = () => {
  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  return (
    <Button
      variant='outlined'
      fullWidth
      sx={{
        maxWidth: 368,
        textTransform: 'capitalize',
        alignSelf: 'flex-end',
      }}
      onClick={handleOpen}
    >
      Learn About KSU Loyalty
    </Button>
  )
}

export default LearnButton
