'use client'

import { Container, Toolbar } from '@mui/material'
import Link from 'next/link'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import ConnectWallet from '@/components/molecules/header/ConnectWallet'
import Navigation from '@/components/molecules/header/Navigation'
import HeaderBar from '@/components/organisms/header/HeaderBar'

import KasuLogo from '@/assets/logo/Kasu'

import { BaseRoutesPaths } from '@/config/routes'

const Header = () => {
  const currentDevice = useDeviceDetection()
  const logoWidth = currentDevice === Device.MOBILE ? '92px' : '125px'
  const logoHeight = currentDevice === Device.MOBILE ? '42px' : '64px'
  const toolbarHeight = currentDevice === Device.MOBILE ? 74 : undefined

  return (
    <HeaderBar>
      <Container maxWidth='lg'>
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            height: toolbarHeight,
          }}
        >
          <Link href={BaseRoutesPaths.LENDING}>
            <KasuLogo width={logoWidth} height={logoHeight} />
          </Link>
          <Navigation />
          {currentDevice !== Device.MOBILE && <ConnectWallet />}
        </Toolbar>
      </Container>
    </HeaderBar>
  )
}

export default Header
