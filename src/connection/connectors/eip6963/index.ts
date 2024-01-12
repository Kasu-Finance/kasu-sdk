import { initializeConnector } from '@web3-react/core';

import { web3reactError } from '@/utils';

import { EIP6963 } from './eip6963.connector';

import { ConnectionType, InjectedConnection, ProviderInfo } from '@/types/connectors';

const [eip6963, eip6963hooks] = initializeConnector<EIP6963>(
    (actions) => new EIP6963({ actions, onError: web3reactError })
);
// Since eip6963 wallet are `announced` dynamically after compile-time, but web3provider required connectors to be statically defined,
// we define a static eip6963Connection object that provides access to all eip6963 wallets. The `wrap` function is used to obtain a copy
// of the connection with metadata & activation for a specific extension/provider.
export const eip6963Connection: InjectedConnection = {
    getProviderInfo: () =>
        eip6963.provider.currentProviderDetail?.info ?? { name: 'Browser Wallet' },
    selectRdns: (rdns: string) => eip6963.selectProvider(rdns),
    connector: eip6963,
    hooks: eip6963hooks,
    type: ConnectionType.EIP_6963_INJECTED,
    shouldDisplay: () => false, // Since we display each individual eip6963 wallet, we shouldn't display this generic parent connection
    wrap(providerInfo: ProviderInfo) {
        const { rdns } = providerInfo;

        if (!rdns) return undefined;
        return {
            ...this,
            getProviderInfo: () => providerInfo,
            overrideActivate() {
                eip6963.selectProvider(rdns); // Select the specific eip6963 provider before activating
                return false;
            },
            shouldDisplay: () => true, // Individual eip6963 wallets should always be displayed
        };
    },
};
