import { Box, Container } from '@mui/material'
import Link from 'next/link'

import ConnectWalletButton from '@/components/atoms/ConnectWalletButton'
import Navigation from '@/components/molecules/header/Navigation'
import HeaderBar from '@/components/organisms/header/HeaderBar'
import HeaderLogo from '@/components/organisms/header/HeaderLogo'
import ModeToggleButton from '@/components/organisms/header/ModeToggleButton'
import Toolbar from '@/components/organisms/header/Toolbar'

import { BaseRoutesPaths } from '@/config/routes'

const Header = () => {
  return (
    <HeaderBar>
      <Container maxWidth='lg'>
        <Toolbar>
          <Link href={BaseRoutesPaths.LENDING}>
            <HeaderLogo />
          </Link>
          <Navigation />
          <Box display='flex' alignItems='center'>
            {/* <ReferButton /> */}
            <ModeToggleButton />
            <ConnectWalletButton />
            {/* <CurrentLoyaltyCrown /> */}
          </Box>
        </Toolbar>
      </Container>
    </HeaderBar>
  )
}

export default Header
