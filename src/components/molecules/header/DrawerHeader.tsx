import CloseIcon from '@mui/icons-material/Close'
import { AppBar, IconButton, Theme, Toolbar } from '@mui/material'
import Link from 'next/link'

import KasuLogo from '@/assets/logo/Kasu'

import { BaseRoutesPaths } from '@/config/routes'

interface DrawerHeaderProps {
  onClose: () => void
  theme: Theme
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ onClose, theme }) => (
  <AppBar
    position='static'
    color='transparent'
    elevation={0}
    sx={{
      width: '100vw',
      bgcolor: theme.palette.primary.contrastText,
      color: theme.palette.common.white,
    }}
  >
    <Toolbar
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Link href={BaseRoutesPaths.LENDING}>
        <IconButton edge='start' color='inherit' aria-label='Kasu logo'>
          <KasuLogo
            width='75px'
            height='42px'
            color={theme.palette.common.white}
          />
        </IconButton>
      </Link>

      <IconButton
        edge='end'
        color='inherit'
        onClick={onClose}
        aria-label='close drawer'
      >
        <CloseIcon
          sx={{ width: '16px', height: '16px', mr: 0.5 }}
          color='primary'
        />
      </IconButton>
    </Toolbar>
  </AppBar>
)

export default DrawerHeader
