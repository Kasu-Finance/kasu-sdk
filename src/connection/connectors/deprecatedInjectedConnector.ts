import { Connection, ConnectionType } from '@/types/connectors';
import { web3reactError } from '@/utils';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { getDeprecatedInjection } from './connectors.helper';

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>(
    (actions) => new MetaMask({ actions, onError: web3reactError })
);

export const deprecatedInjectedConnection: Connection = {
    connector: web3Injected,
    hooks: web3InjectedHooks,
    type: ConnectionType.INJECTED,
    getProviderInfo: () => getDeprecatedInjection() ?? { name: '' },
    shouldDisplay: () => true,
};
