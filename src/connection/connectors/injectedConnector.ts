import { Connection, ConnectionType } from '@/types/connectors';
import { web3reactError } from '@/utils';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>(
    (actions) => new MetaMask({ actions, onError: web3reactError })
);

export const injectedConnection: Connection = {
    connector: web3Injected,
    hooks: web3InjectedHooks,
    type: ConnectionType.INJECTED,
};
