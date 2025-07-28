'use client'

import { AppBar, useScrollTrigger } from '@mui/material'
import { ReactNode } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'

type HeaderBarProps = {
  children: ReactNode
}

// separate into its own component for SSR
const HeaderBar: React.FC<HeaderBarProps> = ({ children }) => {
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true,
  })

  const { isLiteMode } = useLiteModeState()

  return (
    <AppBar
      position='sticky'
      elevation={trigger ? 4 : 0}
      sx={
        isLiteMode
          ? {
              bgcolor: 'transparent',
            }
          : undefined
      }
    >
      {children}
    </AppBar>
  )
}

export default HeaderBar
