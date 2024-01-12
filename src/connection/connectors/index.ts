import { Connector } from '@web3-react/types';

import { coinbaseWalletConnection } from './coinbaseConnector';
import { deprecatedInjectedConnection } from './deprecatedInjectedConnector';
import { eip6963Connection } from './eip6963';
import { gnosisSafeConnection } from './gnosisSafeConnector';
import { networkConnection } from './networkConnector';
import { walletConnectConnection } from './walletConnectConnector';

import { ConnectionType } from '@/types/connectors';

export const connections = [
    gnosisSafeConnection,
    deprecatedInjectedConnection,
    walletConnectConnection,
    coinbaseWalletConnection,
    eip6963Connection,
    networkConnection,
];

export function getConnection(connector: Connector | ConnectionType) {
    if (connector instanceof Connector) {
        const connection = connections.find(
            (connection) => connection.connector === connector
        );
        if (!connection) {
            throw Error('unsupported connector');
        }
        return connection;
    } else {
        switch (connector) {
            case ConnectionType.INJECTED:
                return deprecatedInjectedConnection;
            case ConnectionType.COINBASE_WALLET:
                return coinbaseWalletConnection;
            case ConnectionType.WALLET_CONNECT_V2:
                return walletConnectConnection;
            case ConnectionType.NETWORK:
                return networkConnection;
            case ConnectionType.GNOSIS_SAFE:
                return gnosisSafeConnection;
            case ConnectionType.EIP_6963_INJECTED:
                return eip6963Connection;
        }
    }
}
