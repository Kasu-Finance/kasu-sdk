'use client';

import Modal from '@/components/atoms/Modal';
import { SupportedChainIds } from '@/connection/chains';
import { useOrderedConnections } from '@/hooks/useOrderedConnections';
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

    const tryActivation = useCallback(
        async (connection: Connection) => {
            const polygon: AddEthereumChainParameter = {
                chainId: 137,
                chainName: 'Polygon',
                nativeCurrency: {
                    decimals: 18,
                    name: 'Matic Token',
                    symbol: 'MATIC',
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com'],
            };
            try {
                if (connection.overrideActivate?.()) return;

                await connection.connector.activate(
                    chainId === SupportedChainIds.MAINNET
                        ? polygon
                        : SupportedChainIds.MAINNET
                );

                // if (connector instanceof GnosisSafe) {
                //     await void connector.activate();
                // } else if (
                //     connector instanceof WalletConnect ||
                //     connector instanceof Network
                // ) {
                //     await connector.activate(chain);
                // } else {
                //     await connector.activate(getAddChainParameters(chain));
                // }
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
            <button onClick={disconnect}>disconnect</button>
        </Modal>
    );
};

export default ConnectWalletModal;
