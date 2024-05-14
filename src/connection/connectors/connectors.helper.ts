import { MetamaskIcon } from '@/assets/icons'
import MetamaskLogoIcon from '@/assets/icons/connectors/MetamaskLogoIcon'

import { ProviderInfo } from '@/types/connectors'

type InjectedWalletKey = keyof NonNullable<Window['ethereum']>

const InjectedWalletTable: { [key in InjectedWalletKey]?: ProviderInfo } = {
  isBraveWallet: { name: 'Brave', icon: 'Brave Icon' },
  isRabby: { name: 'Rabby', icon: 'Rabby Icon' },
  isTrust: { name: 'Trust Wallet', icon: 'TrustWallet Icon' },
  isLedgerConnect: { name: 'Ledger', icon: 'Ledger Icon' },
}

export const getDeprecatedInjection = (): ProviderInfo | undefined => {
  if (typeof window === 'undefined') return

  for (const [key, wallet] of Object.entries(InjectedWalletTable)) {
    if (window.ethereum?.[key as keyof Window['ethereum']]) return wallet
  }

  // Check for MetaMask last, as some injectors will set isMetaMask = true in addition to their own, i.e. Brave browser
  if (window.ethereum?.isMetaMask)
    return { name: 'MetaMask', icon: MetamaskIcon() }

  // Prompt MetaMask install when no window.ethereum or eip6963 injection is present, or the only injection detected is coinbase (CB has separate entry point in UI)
  if (!window.ethereum || window.ethereum.isCoinbaseWallet)
    return { name: 'Install MetaMask', icon: MetamaskLogoIcon() }

  // Use a generic icon when injection is present but no known non-coinbase wallet is detected
  return {
    name: 'Browser Wallet',
    icon: '',
  }
}
