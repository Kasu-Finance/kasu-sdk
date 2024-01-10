'use client'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import ConnectWalletModal from '@/components/molecules/ConnectWalletModal'

import { WalletIcon } from '@/assets/icons'
import KasuLogo from '@/assets/logo/Kasu'

import { MENU_ITEMS } from '@/config/navigation'

const Header = () => {
  const pathName = usePathname()
  const theme = useTheme()

  const isLinkActive = (href: string) => pathName === href

  return (
    <AppBar sx={{ background: 'white' }} position='static'>
      <Container maxWidth='lg'>
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex' }}>
            <KasuLogo color={theme.palette.primary.main} />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {MENU_ITEMS.map((page) => (
              <Link key={page.href} href={page.href}>
                <Button
                  variant='text'
                  sx={{
                    color: isLinkActive(page.href) ? 'primary.main' : 'inherit',
                    // Additional styling for active link
                    borderBottom: isLinkActive(page.href)
                      ? '2px solid currentColor'
                      : 'none',
                  }}
                >
                  {page.title}
                </Button>
              </Link>
            ))}
          </Box>

          {/* <Navigation nav={MENU_ITEMS} /> */}

          <ConnectWalletModal
            trigger={
              <>
                <WalletIcon />
                <Typography>Connect Wallet</Typography>
              </>
            }
          />
          <Box sx={{ flexGrow: 0 }}>
            <Button
              variant='contained'
              sx={{ pl: 2, pr: 2 }}
              startIcon={<WalletIcon />}
            >
              Connect wallet
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
