'use client'

import { AppBar, useScrollTrigger } from '@mui/material'
import { ReactNode } from 'react'

type HeaderBarProps = {
  children: ReactNode
}

// separate into its own component for SSR
const HeaderBar: React.FC<HeaderBarProps> = ({ children }) => {
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true,
  })

  return (
    <AppBar position='sticky' elevation={trigger ? 4 : 0}>
      {children}
    </AppBar>
  )
}

export default HeaderBar
