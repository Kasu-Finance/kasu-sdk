import { Container } from '@mui/material'
import Link from 'next/link'

import Navigation from '@/components/molecules/header/Navigation'
import HeaderActions from '@/components/organisms/header/HeaderActions'
import HeaderBar from '@/components/organisms/header/HeaderBar'
import HeaderLogo from '@/components/organisms/header/HeaderLogo'
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
          <HeaderActions />
        </Toolbar>
      </Container>
    </HeaderBar>
  )
}

export default Header
