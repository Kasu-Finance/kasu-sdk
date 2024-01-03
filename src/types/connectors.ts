import { Web3ReactHooks } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { ReactNode } from 'react';

export enum ConnectionType {
    INJECTED = 'INJECTED',
    COINBASE_WALLET = 'COINBASE_WALLET',
    WALLET_CONNECT_V2 = 'WALLET_CONNECT_V2',
    NETWORK = 'NETWORK',
    GNOSIS_SAFE = 'GNOSIS_SAFE',
    EIP_6963_INJECTED = 'EIP_6963_INJECTED',
}

export type ProviderInfo = {
    name: string;
    icon?: ReactNode;
    rdns?: string;
};

/**
 * @shouldDisplay determines if connector should be shown on UI
 */
export type Connection = {
    connector: Connector;
    hooks: Web3ReactHooks;
    type: ConnectionType;
    shouldDisplay: () => boolean;
    getProviderInfo: () => ProviderInfo;
    overrideActivate?: () => boolean;
};

/**
 * @wrap Returns a copy of the connection with metadata & activation for a specific extension/provider
 */
export type InjectedConnection = Connection & {
    wrap: (providerInfo: ProviderInfo) => Connection | undefined;
    selectRdns(rdns: string): void;
};
