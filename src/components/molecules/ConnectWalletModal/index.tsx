'use client';

import Modal from '@/components/atoms/Modal';
import { SupportedChainIds } from '@/connection/chains';
import { networks } from '@/connection/networks';
import { useOrderedConnections } from '@/hooks/web3/useOrderedConnections';
import useSwitchChain from '@/hooks/web3/useSwitchChain';
import { Connection } from '@/types/connectors';
import { web3reactError } from '@/utils';
import { didUserReject } from '@/utils/didUserReject';
import { useWeb3React } from '@web3-react/core';
import { AddEthereumChainParameter, Connector } from '@web3-react/types';
import { ReactNode, useCallback } from 'react';

type ConnectWalletModalProps = {
    trigger: ReactNode;
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ trigger }) => {
    const connections = useOrderedConnections();

    const { chainId, account, connector } = useWeb3React();

    const switchChain = useSwitchChain();

    const tryActivation = useCallback(
        async (connection: Connection) => {
            try {
                if (connection.overrideActivate?.()) return;

                await connection.connector.activate();
            } catch (error) {
                // Ideally set to setError global context.
                web3reactError(error as Error);

                if (didUserReject(connection, error)) {
                    console.log('user rejected');
                }
            }
        },
        [chainId]
    );

    const selectChain = async () => {
        try {
            await switchChain(SupportedChainIds.ARBITRUM_ONE);
        } catch (error) {
            console.log(error);
        }
    };

    const disconnect = useCallback(() => {
        if (connector && connector.deactivate) {
            connector.deactivate();
        }
        connector.resetState();
    }, [connector]);

    return (
        <Modal trigger={trigger}>
            <div>Connected : {account ?? 'not connected'}</div>
            <div>ChainID : {chainId ?? 'not connected'}</div>
            {connections.orderedConnections.map((connection) => {
                return (
                    <div
                        key={connection.getProviderInfo().name}
                        onClick={() => tryActivation(connection)}
                    >
                        {connection.getProviderInfo().name}
                    </div>
                );
            })}
            <button onClick={selectChain}>switch chain</button>
            <button onClick={disconnect}>disconnect</button>
        </Modal>
    );
};

export default ConnectWalletModal;
