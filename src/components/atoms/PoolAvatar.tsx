'use client'

import Avatar from '@mui/material/Avatar'
import { styled, SxProps } from '@mui/material/styles'
import React from 'react'

import useImageError from '@/hooks/useImageError'

import getInitials from '@/utils/getInitials'

const StyledAvatarContainer = styled('div')(() => ({
  position: 'relative',
  display: 'inline-block',
}))

const ActiveStatusIcon = styled('span')((props) => ({
  position: 'absolute',
  bottom: 5,
  right: 5,
  height: '12px',
  width: '12px',
  backgroundColor: props.theme.palette.success.main,
  borderRadius: '50%',
  border: '2px solid white',
  transform: 'translate(50%, 50%)',
}))

interface AvatarProps {
  src?: string
  name?: string
  showIconStatus?: boolean
  iconStatusSx?: SxProps
}

const PoolAvatar: React.FC<AvatarProps> = ({
  src,
  name,
  showIconStatus,
  iconStatusSx,
  ...props
}) => {
  const imgError = useImageError(src)
  const initials: string = name ? getInitials(name) : ''

  return (
    <StyledAvatarContainer>
      <Avatar
        {...props}
        sx={{ boxShadow: '0 0 8px rgba(0,0,0,.14) inset' }}
        src={!imgError ? src : undefined}
      >
        {imgError ? initials : null}
      </Avatar>

      {showIconStatus && <ActiveStatusIcon sx={iconStatusSx} />}
    </StyledAvatarContainer>
  )
}

export default PoolAvatar
