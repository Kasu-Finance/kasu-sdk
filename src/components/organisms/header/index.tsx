import HeaderLogo from '@/assets/logo/HeaderLogo';
import Navigation, { NavigationProps } from './Navigation';
import ConnectWalletModal from '@/components/molecules/ConnectWalletModal';
import Typography from '@/components/atoms/Typography';
import { WalletIcon } from '@/assets/icons';

import './header.scss';

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
        <header>
            <div className='container'>
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
            </div>
        </header>
    );
};

export default Header;
