import { initializeConnector } from '@web3-react/core';
import { Network } from '@web3-react/network';

import { RPC_PROVIDERS } from '../providers';

import { Connection, ConnectionType } from '@/types/connectors';

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
    (actions) => new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: 1 })
);

export const networkConnection: Connection = {
    connector: web3Network,
    hooks: web3NetworkHooks,
    type: ConnectionType.NETWORK,
    shouldDisplay: () => false,
    getProviderInfo: () => ({ name: 'Network' }),
};
