'use client'

import { Button, ButtonProps } from '@mui/material'
import { useRouter } from 'next/navigation'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

const BackButton: React.FC<ButtonProps> = ({ startIcon, ...props }) => {
  const router = useRouter()
  const { t } = useTranslation()

  const handleBack = () => {
    router.back()
  }

  return (
    <Button {...props} onClick={handleBack} startIcon={startIcon}>
      {props.children || t('general.goBack')}
    </Button>
  )
}

export default BackButton
