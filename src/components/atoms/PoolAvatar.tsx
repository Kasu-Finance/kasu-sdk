'use client'

import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'
import React from 'react'

import useImageError from '@/hooks/useImageError'

import getInitials from '@/utils/getInitials'

const StyledAvatarContainer = styled('div')(() => ({
  position: 'relative',
  display: 'inline-block',
}))

const ActiveStatusIcon = styled('span')(() => ({
  position: 'absolute',
  bottom: 5,
  right: 5,
  height: '12px',
  width: '12px',
  backgroundColor: 'rgba(171, 212, 140, 1)',
  borderRadius: '50%',
  border: '2px solid white',
  transform: 'translate(50%, 50%)',
}))

interface AvatarProps {
  src?: string
  name?: string
  showActiveStatus?: boolean
}

const PoolAvatar: React.FC<AvatarProps> = ({
  src,
  name,
  showActiveStatus,
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

      {showActiveStatus && <ActiveStatusIcon />}
    </StyledAvatarContainer>
  )
}

export default PoolAvatar
