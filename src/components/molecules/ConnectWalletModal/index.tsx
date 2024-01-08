'use client';

import Modal from '@/components/atoms/Modal';
import { SupportedChainIds } from '@/connection/chains';
import { setRecentWeb3Connection } from '@/connection/connection.helper';
import { getConnection } from '@/connection/connectors';
import { networks } from '@/connection/networks';
import { useOrderedConnections } from '@/hooks/web3/useOrderedConnections';
import useSwitchChain from '@/hooks/web3/useSwitchChain';
import { Connection } from '@/types/connectors';
import { web3reactError, didUserReject } from '@/utils';
import { useWeb3React } from '@web3-react/core';
import { AddEthereumChainParameter, Connector } from '@web3-react/types';
import { ReactNode, useCallback, useEffect } from 'react';

type ConnectWalletModalProps = {
    trigger: ReactNode;
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ trigger }) => {
    const connections = useOrderedConnections();

    const { chainId, account, connector, ENSName } = useWeb3React();

    const connection = getConnection(connector);

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

        setRecentWeb3Connection(undefined);
    }, [connector]);

    useEffect(() => {
        if (account || ENSName) {
            setRecentWeb3Connection({
                type: connection.type,
                address: account,
                disconnected: false,
                ENSName: ENSName ?? undefined,
                rdns: connection.getProviderInfo().rdns,
            });
        }
    }, [ENSName, account, connection]);

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
