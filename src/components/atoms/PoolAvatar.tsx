import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import { SxProps, useTheme } from '@mui/material/styles'
import React from 'react'

import useImageError from '@/hooks/useImageError'

import getInitials from '@/utils/getInitials'

interface AvatarProps {
  src?: string
  name?: string
  showStatus?: boolean
  sx?: SxProps
}

const PoolAvatar: React.FC<AvatarProps> = ({
  src,
  name,
  showStatus = true,
  sx,
  ...props
}) => {
  const imgError = useImageError(src)
  const initials = name ? getInitials(name) : ''
  const theme = useTheme()

  const avatarContent = imgError ? initials : null
  const avatarSrc = imgError ? undefined : src

  return (
    <Badge
      overlap='circular'
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant='dot'
      invisible={!showStatus}
      sx={{
        '& .MuiBadge-badge': {
          backgroundColor: theme.palette.success.main,
          color: theme.palette.getContrastText(theme.palette.success.main),
          height: 12,
          width: 12,
          borderRadius: '50%',
          border: `2px solid ${theme.palette.background.paper}`,
          transform: 'translate(50%, 50%)',
        },
      }}
    >
      <Avatar
        {...props}
        sx={{ ...sx, boxShadow: '0 0 8px rgba(0,0,0,0.14) inset' }}
        src={avatarSrc}
      >
        {avatarContent}
      </Avatar>
    </Badge>
  )
}

export default PoolAvatar
