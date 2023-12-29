import './header.scss'

import Container from '@/components/atoms/Container'
import Typography from '@/components/atoms/Typography'
import ConnectWalletModal from '@/components/molecules/ConnectWalletModal'
import { StyledHeader } from '@/components/organisms/header/header.style'

import { WalletIcon } from '@/assets/icons'
import HeaderLogo from '@/assets/logo/HeaderLogo'

import { MENU_ITEMS } from '@/config/navigation'

import Navigation from './Navigation'

const Header = () => {
  return (
    <StyledHeader>
      <Container>
        <HeaderLogo />
        <Navigation nav={MENU_ITEMS} />
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
