'use client'

import {
  AppBar,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
} from '@mui/material'
import { ReactNode } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'

type HeaderBarProps = {
  children: ReactNode
}

// separate into its own component for SSR
const HeaderBar: React.FC<HeaderBarProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true,
  })

  const { isLiteMode } = useLiteModeState()

  return (
    <AppBar
      position={isLiteMode && isMobile ? 'fixed' : 'sticky'}
      elevation={trigger ? 4 : 0}
      sx={
        isLiteMode
          ? {
              top: 0,
              left: 0,
              right: 0,
              bgcolor: trigger ? 'rgba(11, 11, 13, 0.8)' : 'transparent',
              backdropFilter: trigger ? 'blur(10px)' : 'none',
            }
          : undefined
      }
    >
      {children}
    </AppBar>
  )
}

export default HeaderBar
