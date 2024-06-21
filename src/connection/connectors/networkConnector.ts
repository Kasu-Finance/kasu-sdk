import { initializeConnector } from '@web3-react/core'
import { Network } from '@web3-react/network'

import { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'

import { RPC_PROVIDERS } from '../providers'

import { Connection, ConnectionType } from '@/types/connectors'

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) =>
    new Network({
      actions,
      urlMap: RPC_PROVIDERS,
      defaultChainId:
        NETWORK === 'BASE'
          ? SupportedChainIds.BASE
          : SupportedChainIds.BASE_SEPOLIA,
    })
)

export const networkConnection: Connection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
  shouldDisplay: () => false,
  getProviderInfo: () => ({ name: 'Network' }),
}
