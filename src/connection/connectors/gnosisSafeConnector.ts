import { Connection, ConnectionType } from '@/types/connectors';
import { initializeConnector } from '@web3-react/core';
import { GnosisSafe } from '@web3-react/gnosis-safe';

const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<GnosisSafe>(
    (actions) => new GnosisSafe({ actions })
);
export const gnosisSafeConnection: Connection = {
    connector: web3GnosisSafe,
    hooks: web3GnosisSafeHooks,
    type: ConnectionType.GNOSIS_SAFE,
    shouldDisplay: () => false,
    getProviderInfo: () => ({
        name: 'Gnosis Safe',
        icon: '',
    }),
};
