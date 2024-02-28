'use client'
import { Avatar, AvatarProps } from '@mui/material'
import { FC } from 'react'

import useImageError from '@/hooks/useImageError'

import createNameInitials from '@/utils/createNameInitials'

interface AppAvatarProps extends AvatarProps {
  src?: string
  name?: string
}

const AppAvatar: FC<AppAvatarProps> = ({ src, name, ...props }) => {
  const imgError = useImageError(src)
  const initials: string = name ? createNameInitials(name) : ''

  return (
    <Avatar {...props} src={!imgError ? src : undefined}>
      {imgError && initials}
    </Avatar>
  )
}

export default AppAvatar
