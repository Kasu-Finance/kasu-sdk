'use client'

import Avatar, { AvatarProps as MUIAvatarProps } from '@mui/material/Avatar'

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
    <Avatar
      {...props}
      sx={{ boxShadow: '0 0 8px rgba(0,0,0,.14) inset', ...props.sx }}
      src={!imgError ? src : undefined}
    >
      {imgError && initials}
    </Avatar>
  )
}

export default PoolAvatar
