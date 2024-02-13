'use client'

import Button, { ButtonProps } from '@mui/material/Button'
import { useRouter } from 'next/navigation'
import React from 'react'

interface BackButtonProps extends ButtonProps {}

const BackButton: React.FC<BackButtonProps> = (props) => {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <Button {...props} onClick={handleBack}>
      {props.children || 'Go Back'}
    </Button>
  )
}

export default BackButton
