import HeaderLogo from '@/assets/logo/HeaderLogo';
import Navigation, { NavigationProps } from './Navigation';

import './header.scss';
import { StyledHeader } from './header.style';
import Container from '@/components/atoms/Container';
import ConnectWallet from './ConnectWallet';

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
];

const Header = () => {
    return (
        <StyledHeader>
            <Container>
                <HeaderLogo />
                <Navigation links={navLinks} />
                <ConnectWallet />
            </Container>
        </StyledHeader>
    );
};

export default Header;
