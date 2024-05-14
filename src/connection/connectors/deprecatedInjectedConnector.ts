import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { web3reactError } from '@/utils'

import { getDeprecatedInjection } from './connectors.helper'

import { Connection, ConnectionType } from '@/types/connectors'

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, onError: web3reactError })
)

const isInjected = typeof window !== 'undefined' && Boolean(window.ethereum)
const isCoinbaseWallet =
  typeof window !== 'undefined' && Boolean(window.ethereum?.isCoinbaseWallet)

const getShouldAdvertiseMetaMask = () =>
  getDeprecatedInjection()?.name !== 'MetaMask' &&
  (!isInjected || isCoinbaseWallet)

export const deprecatedInjectedConnection: Connection = {
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  getProviderInfo: () => getDeprecatedInjection() ?? { name: '' },
  shouldDisplay: () => true,
  overrideActivate: () => {
    if (getShouldAdvertiseMetaMask()) {
      window.open('https://metamask.io/', 'inst_metamask')
      return true
    }
    return false
  },
}
