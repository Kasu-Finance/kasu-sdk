'use client'

import { Box, useMediaQuery, useTheme } from '@mui/material'

import useLiteModeState from '@/hooks/context/useLiteModeState'

import ConnectWalletButton from '@/components/atoms/ConnectWalletButton'
import LiteMobileMenu from '@/components/organisms/header/LiteMobileMenu'
import ModeToggleButton from '@/components/organisms/header/ModeToggleButton'
import PortfolioRedirect from '@/components/organisms/header/PortfolioRedirect'
import ReferButton from '@/components/organisms/header/ReferButton'

const HeaderActions = () => {
  const { isLiteMode } = useLiteModeState()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isLiteMode && isMobile) {
    return (
      <Box display='flex' alignItems='center' gap={1}>
        <ConnectWalletButton compact />
        <LiteMobileMenu />
      </Box>
    )
  }

  return (
    <Box display='flex' alignItems='center'>
      <ReferButton />
      <PortfolioRedirect />
      <ModeToggleButton />
      <ConnectWalletButton />
    </Box>
  )
}

export default HeaderActions
