'use client'

import { Button, ButtonProps } from '@mui/material'
import { useRouter } from 'next/navigation'
import React from 'react'

const BackButton: React.FC<ButtonProps> = (props) => {
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
