import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'

import ConnectWallet from '@/components/molecules/header/ConnectWallet'
import Navigation from '@/components/molecules/header/Navigation'
import HeaderBar from '@/components/organisms/header/HeaderBar'

import KasuLogo from '@/assets/logo/Kasu'

const Header = () => {
  return (
    <HeaderBar>
      <Container maxWidth='lg'>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <KasuLogo />
          <Navigation />
          <ConnectWallet />
        </Toolbar>
      </Container>
    </HeaderBar>
  )
}

export default Header
