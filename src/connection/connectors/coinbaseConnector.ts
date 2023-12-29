import { initializeConnector } from '@web3-react/core';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { RPC_URLS } from '../networks';
import { SupportedChainIds } from '../chains';
import { web3reactError } from '@/utils';
import { Connection, ConnectionType } from '@/types/connectors';

const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
    (actions) =>
        new CoinbaseWallet({
            actions,
            options: {
                url: RPC_URLS[SupportedChainIds.MAINNET][0],
                appName: 'Spool',
                reloadOnDisconnect: false,
            },
            onError: web3reactError,
        })
);
export const coinbaseWalletConnection: Connection = {
    connector: web3CoinbaseWallet,
    hooks: web3CoinbaseWalletHooks,
    type: ConnectionType.COINBASE_WALLET,
};
