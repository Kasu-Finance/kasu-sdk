import { Box, Container } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

import ConnectWallet from '@/components/molecules/header/ConnectWallet'
import Navigation from '@/components/molecules/header/Navigation'
import HeaderBar from '@/components/organisms/header/HeaderBar'
import Toolbar from '@/components/organisms/header/Toolbar'

import KasuLogo from '@/assets/logo/Kasu'

import { BaseRoutesPaths } from '@/config/routes'
import Crown from '@/images/crown.png'

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
            <ConnectWallet />
            <Box ml={1.5} component={Image} src={Crown} alt='Crown' />
          </Box>
        </Toolbar>
      </Container>
    </HeaderBar>
  )
}

export default Header
