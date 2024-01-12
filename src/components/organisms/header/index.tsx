import HeaderLogo from '@/assets/logo/HeaderLogo'
import Navigation, { NavigationProps } from './Navigation'

import Container from '@/components/atoms/Container'
import ConnectWallet from './ConnectWallet'
import { StyledHeader } from './header.style'

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
      <Container
        styles={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <HeaderLogo />
        <Navigation links={navLinks} />
        <ConnectWallet />
      </Container>
    </StyledHeader>
  )
}

export default Header
