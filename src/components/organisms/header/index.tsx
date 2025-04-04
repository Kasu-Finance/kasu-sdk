import { Box, Container } from '@mui/material'
import Link from 'next/link'

import ConnectWalletButton from '@/components/atoms/ConnectWalletButton'
import Navigation from '@/components/molecules/header/Navigation'
import HeaderBar from '@/components/organisms/header/HeaderBar'
import Toolbar from '@/components/organisms/header/Toolbar'

import KasuLogo from '@/assets/logo/Kasu'

import { BaseRoutesPaths } from '@/config/routes'

const Header = () => {
  return (
    <HeaderBar>
      <Container maxWidth='lg'>
        <Toolbar>
          <Link href={BaseRoutesPaths.LENDING}>
            <KasuLogo />
          </Link>
          <Navigation />
          <Box display='flex' alignItems='center' ml='auto'>
            <ConnectWalletButton />
            {/* <CurrentLoyaltyCrown /> */}
          </Box>
        </Toolbar>
      </Container>
    </HeaderBar>
  )
}

export default Header
