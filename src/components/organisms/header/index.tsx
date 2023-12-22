import HeaderLogo from '@/assets/logo/HeaderLogo';
import Navigation, { NavigationProps } from './Navigation';
import ConnectWalletModal from '@/components/molecules/ConnectWalletModal';
import Typography from '@/components/atoms/Typography';
import { WalletIcon } from '@/assets/icons';

import './header.scss';
import { StyledHeader } from './header.style';
import Container from '@/components/atoms/Container';

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
    );
};

export default Header;
