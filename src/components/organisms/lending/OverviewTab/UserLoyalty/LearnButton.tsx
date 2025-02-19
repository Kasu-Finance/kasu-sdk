'use client'

import { Button, ButtonProps } from '@mui/material'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

const LearnButton: React.FC<ButtonProps> = (props) => {
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
      {...props}
    >
      Learn About KSU Loyalty
    </Button>
  )
}

export default LearnButton
