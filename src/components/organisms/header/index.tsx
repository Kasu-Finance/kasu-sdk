import { Container, Toolbar } from '@mui/material'
import Link from 'next/link'

import ConnectWallet from '@/components/molecules/header/ConnectWallet'
import Navigation from '@/components/molecules/header/Navigation'
import HeaderBar from '@/components/organisms/header/HeaderBar'

import KasuLogo from '@/assets/logo/Kasu'

import { BaseRoutesPaths } from '@/config/routes'

const Header = () => {
  return (
    <HeaderBar>
      <Container maxWidth='lg'>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Link href={BaseRoutesPaths.LENDING}>
            <KasuLogo />
          </Link>
          <Navigation />
          <ConnectWallet />
        </Toolbar>
      </Container>
    </HeaderBar>
  )
}

export default Header
