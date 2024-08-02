import { Box } from '@mui/material'

import DesktopNavigation from '@/components/molecules/header/DesktopNavigation'

const Navigation = () => {
  return (
    <Box sx={{ display: 'flex', ml: 3 }}>
      {/* <IconButton
        color='primary'
        aria-label='open drawer'
        edge='start'
        onClick={handleDrawerToggle}
        sx={{
          display: { sm: 'none' },
          border: '1px solid',
          borderRadius: '4px',
          width: '2rem',
          height: '2rem',
        }}
      >
        <SortIcon color='primary' />
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
          handleDrawerToggle={handleDrawerToggle}
          isActiveLink={isActiveLink}
        />
      </Drawer> */}

      <DesktopNavigation />
    </Box>
  )
}

export default Navigation
