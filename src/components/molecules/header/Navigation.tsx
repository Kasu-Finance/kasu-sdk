import MenuIcon from '@mui/icons-material/Menu'
import { Box, Drawer, IconButton, useTheme } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import DesktopNavigation from '@/components/molecules/header/DesktopNavigation'
import MobileDrawer from '@/components/molecules/header/MobileDrawer'

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const { account } = useWeb3React()
  const pathName = usePathname()

  const isActiveLink = (href: string) =>
    pathName === href || pathName.includes(href)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', ml: theme.spacing(3) }}>
      <IconButton
        color='inherit'
        aria-label='open drawer'
        edge='start'
        onClick={handleDrawerToggle}
        sx={{ display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor='right'
        variant='temporary'
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: '100vw' },
        }}
      >
        <MobileDrawer
          theme={theme}
          account={account}
          handleDrawerToggle={handleDrawerToggle}
          isActiveLink={isActiveLink}
        />
      </Drawer>

      <DesktopNavigation isActiveLink={isActiveLink} account={account} />
    </Box>
  )
}

export default Navigation
