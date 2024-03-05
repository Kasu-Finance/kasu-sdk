'use client'

import MUIAvatar, { AvatarProps as MUIAvatarProps } from '@mui/material/Avatar'
import React from 'react'

import useImageError from '@/hooks/useImageError'

import createTwoInitials from '@/utils/createTwoInitials'

interface AvatarProps extends MUIAvatarProps {
  src?: string
  name?: string
}

const Avatar: React.FC<AvatarProps> = ({ src, name, ...props }) => {
  const imgError = useImageError(src)
  const initials: string = name ? createTwoInitials(name) : ''

  return (
    <MUIAvatar {...props} src={!imgError ? src : undefined}>
      {imgError && initials}
    </MUIAvatar>
  )
}

export default Avatar
