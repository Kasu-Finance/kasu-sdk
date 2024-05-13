import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { web3reactError } from '@/utils'

import { getDeprecatedInjection } from './connectors.helper'

import { Connection, ConnectionType } from '@/types/connectors'

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, onError: web3reactError })
)

export const deprecatedInjectedConnection: Connection = {
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getProviderInfo: () => getDeprecatedInjection() ?? { name: '' },
  shouldDisplay: () => true,
}
