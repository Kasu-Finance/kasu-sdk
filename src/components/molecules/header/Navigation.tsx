'use client'

import { Box } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import DesktopNavigation from '@/components/molecules/header/DesktopNavigation'

const Navigation = () => {
  const { isLiteMode } = useLiteModeState()

  if (isLiteMode) return null

  return (
    <Box sx={{ display: 'flex', ml: 3 }}>
      <DesktopNavigation />
    </Box>
  )
}

export default Navigation
