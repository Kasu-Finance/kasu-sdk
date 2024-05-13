import { initializeConnector } from '@web3-react/core'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

import { WalletConnectIcon } from '@/assets/icons'

import { SupportedChainIds } from '../chains'

import { Connection, ConnectionType } from '@/types/connectors'

const WALLET_CONNECT_V2_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_V2_PROJECT_ID

if (!WALLET_CONNECT_V2_PROJECT_ID) {
  throw new Error(
    'ENV : NEXT_PUBLIC_WALLET_CONNECT_V2_PROJECT_ID is not defined'
  )
}

const [walletConnectV2, walletConnectV2hooks] =
  initializeConnector<WalletConnectV2>(
    (actions) =>
      new WalletConnectV2({
        actions,
        options: {
          projectId: '5c42aeed3e2601d7df2464a8303b7d37',
          chains: [SupportedChainIds.MAINNET],
          showQrModal: true,
          qrModalOptions: {
            themeVariables: {
              '--wcm-z-index': '1301',
            },
          },
        },
      })
  )
export const walletConnectConnection: Connection = {
  connector: walletConnectV2,
  hooks: walletConnectV2hooks,
  type: ConnectionType.WALLET_CONNECT_V2,
  shouldDisplay: () => true,
  getProviderInfo: () => ({
    name: 'Wallet Connect V2',
    icon: WalletConnectIcon(),
  }),
}
