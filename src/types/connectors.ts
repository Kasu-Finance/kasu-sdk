import { Web3ReactHooks } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { ReactNode } from 'react';

export enum ConnectionType {
    INJECTED = 'INJECTED',
    COINBASE_WALLET = 'COINBASE_WALLET',
    WALLET_CONNECT_V2 = 'WALLET_CONNECT_V2',
    NETWORK = 'NETWORK',
    GNOSIS_SAFE = 'GNOSIS_SAFE',
}

/**
 * @getName connector's name
 * @shouldDisplay determines if connector should be shown on UI
 */
export type Connection = {
    connector: Connector;
    hooks: Web3ReactHooks;
    type: ConnectionType;
    getName: () => string;
    shouldDisplay: () => boolean;
    getIcon?: () => ReactNode;
};
