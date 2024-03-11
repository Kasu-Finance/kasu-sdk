'use client'

import MUIAvatar, { AvatarProps as MUIAvatarProps } from '@mui/material/Avatar'
import React from 'react'

import useImageError from '@/hooks/useImageError'

import getInitials from '@/utils/getInitials'

interface AvatarProps extends MUIAvatarProps {
  src?: string
  name?: string
}

const PoolAvatar: React.FC<AvatarProps> = ({ src, name, ...props }) => {
  const imgError = useImageError(src)
  const initials: string = name ? getInitials(name) : ''

  return (
    <MUIAvatar {...props} src={!imgError ? src : undefined}>
      {imgError && initials}
    </MUIAvatar>
  )
}

export default PoolAvatar
