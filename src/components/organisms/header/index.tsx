import './header.scss'

import Container from '@/components/atoms/Container'
import Typography from '@/components/atoms/Typography'
import ConnectWalletModal from '@/components/molecules/ConnectWalletModal'
import { StyledHeader } from '@/components/organisms/header/header.style'

import { WalletIcon } from '@/assets/icons'
import HeaderLogo from '@/assets/logo/HeaderLogo'

// import { StyledHeader } from './header.style'
import Navigation, { NavigationProps } from './Navigation'

const navLinks: NavigationProps['links'] = [
  {
    label: 'Lend',
    to: '/lend',
  },
  {
    label: 'Borrow',
    to: '/borrow',
  },
  {
    label: 'Docs',
    to: '/docs',
  },
  {
    label: 'Locking',
    to: '/locking',
  },
  {
    label: 'Account',
    to: '/account',
  },
]

const Header = () => {
  return (
    <StyledHeader>
      <Container>
        <HeaderLogo />
        <Navigation links={navLinks} />
        <ConnectWalletModal
          trigger={
            <>
              <WalletIcon />
              <Typography variant='span'>Connect Wallet</Typography>
            </>
          }
        />
      </Container>
    </StyledHeader>
  )
}

export default Header
