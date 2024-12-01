import { initializeConnector } from '@web3-react/core'
import { ReactNode } from 'react'

import {
  BitgetIcon,
  CoinbaseIcon,
  MetamaskIcon,
  OkxIcon,
  RabbyIcon,
  RainbowIcon,
  TrustIcon,
} from '@/assets/icons'

import { web3reactError } from '@/utils'

import { EIP6963 } from './eip6963.connector'

import {
  ConnectionType,
  InjectedConnection,
  ProviderInfo,
} from '@/types/connectors'

enum Rdns {
  METAMASK = 'io.metamask',
  COINBASE = 'com.coinbase.wallet',
  RABBY = 'io.rabby',
  OKX = 'com.okex.wallet',
  TRUST = 'com.trustwallet.app',
  RAINBOW = 'me.rainbow',
  BITGET = 'com.bitget.web3',
  PHANTOM = 'app.phantom',
}

const CUSTOM_ICON_MAP: { [rdns in string]?: ReactNode } = {
  [Rdns.METAMASK]: MetamaskIcon(), // MetaMask's provided icon has no padding
  [Rdns.COINBASE]: CoinbaseIcon(),
  [Rdns.RABBY]: RabbyIcon(),
  [Rdns.OKX]: OkxIcon(),
  [Rdns.TRUST]: TrustIcon(),
  [Rdns.RAINBOW]: RainbowIcon(),
  [Rdns.BITGET]: BitgetIcon(),
}

export const isSupportedConnector = (rdns: string): rdns is Rdns => {
  return [
    Rdns.METAMASK,
    Rdns.COINBASE,
    Rdns.RABBY,
    Rdns.OKX,
    Rdns.TRUST,
    Rdns.RAINBOW,
    Rdns.BITGET,
  ].includes(rdns as Rdns)
}

/** Replaces an announced provider's icon with our preferred image, when applicable */
export const applyCustomIcon = (providerInfo: ProviderInfo): ProviderInfo => {
  if (!providerInfo.rdns) return providerInfo

  const customIcon = CUSTOM_ICON_MAP[providerInfo.rdns]

  if (!customIcon) return providerInfo

  return {
    ...providerInfo,
    customIcon: customIcon,
  }
}

const [eip6963, eip6963hooks] = initializeConnector<EIP6963>(
  (actions) => new EIP6963({ actions, onError: web3reactError })
)
// Since eip6963 wallet are `announced` dynamically after compile-time, but web3provider required connectors to be statically defined,
// we define a static eip6963Connection object that provides access to all eip6963 wallets. The `wrap` function is used to obtain a copy
// of the connection with metadata & activation for a specific extension/provider.
export const eip6963Connection: InjectedConnection = {
  getProviderInfo: () =>
    eip6963.provider.currentProviderDetail?.info ?? { name: 'Browser Wallet' },
  selectRdns: (rdns: string) => eip6963.selectProvider(rdns),
  connector: eip6963,
  hooks: eip6963hooks,
  type: ConnectionType.EIP_6963_INJECTED,
  shouldDisplay: () => false, // Since we display each individual eip6963 wallet, we shouldn't display this generic parent connection
  wrap(providerInfo: ProviderInfo) {
    const { rdns } = providerInfo

    if (!rdns) return undefined

    return {
      ...this,
      getProviderInfo: () => applyCustomIcon(providerInfo),
      overrideActivate() {
        eip6963.selectProvider(rdns) // Select the specific eip6963 provider before activating
        return false
      },
      shouldDisplay: () => isSupportedConnector(rdns),
    }
  },
}
