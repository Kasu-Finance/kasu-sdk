import CloseIcon from '@mui/icons-material/Close'
import { AppBar, IconButton, Toolbar } from '@mui/material'
import Link from 'next/link'

import KasuLogo from '@/assets/logo/Kasu'

import { BaseRoutesPaths } from '@/config/routes'

interface DrawerHeaderProps {
  onClose: () => void
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ onClose }) => (
  <AppBar
    position='static'
    color='transparent'
    elevation={0}
    sx={{
      width: '100vw',
      bgcolor: 'primary.contrastText',
      color: 'common.white',
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
          <KasuLogo width='75px' height='42px' color='common.white' />
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
