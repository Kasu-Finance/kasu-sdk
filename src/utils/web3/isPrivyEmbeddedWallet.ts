import { ConnectedWallet } from '@privy-io/react-auth'

const isPrivyEmbeddedWallet = (wallet?: ConnectedWallet | null) => {
  const walletClientType = wallet?.walletClientType
  return walletClientType === 'privy' || walletClientType === 'privy-v2'
}

export default isPrivyEmbeddedWallet
