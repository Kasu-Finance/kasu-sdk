'use client';

import { WalletIcon } from '@/assets/icons';
import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import ConnectWalletModal from '@/components/molecules/ConnectWalletModal';
import formatAccount from '@/utils/formats/formatAccount';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { StyledConnectWalletButton } from './header.style';
import { isSupportedChain } from '@/utils';
import { networkConnection } from '@/connection/connectors/networkConnector';

const ConnectWallet = () => {
    const { account, connector, chainId } = useWeb3React();

    // using state + useEffect here to deal with hydration issue
    const [text, setText] = useState('Connect Wallet');

    useEffect(() => {
        setText(formatAccount(account) || 'Connect Wallet');
    }, [account]);

    useEffect(() => {
        if (
            chainId &&
            isSupportedChain(chainId) &&
            connector !== networkConnection.connector
        ) {
            networkConnection.connector.activate(chainId);
        }
    }, [connector, chainId]);

    return (
        <ConnectWalletModal
            trigger={
                <StyledConnectWalletButton>
                    <WalletIcon />
                    <Typography variant='span'>{text}</Typography>
                </StyledConnectWalletButton>
            }
        />
    );
};

export default ConnectWallet;
