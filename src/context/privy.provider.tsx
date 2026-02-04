'use client'

import {
  PrivyClientConfig,
  PrivyProvider as PrivyRootProvider,
  WalletListEntry,
} from '@privy-io/react-auth'
import { createConfig, WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { http } from 'wagmi'

import { ChainProvider } from '@/context/chain'

import { xdc } from '@/config/chains/xdc'
import { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'
import { PRIVY_LOGO_URL } from '@/constants/privy'

const queryClient = new QueryClient()

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia, xdc] as const,
  transports: {
    [base.id]: http(RPC_URLS[SupportedChainIds.BASE][0]),
    [baseSepolia.id]: http(RPC_URLS[SupportedChainIds.BASE_SEPOLIA][0]),
    [xdc.id]: http(RPC_URLS[SupportedChainIds.XDC][0]),
  },
})

const PRIVY_WALLET_LIST: WalletListEntry[] = [
  'detected_ethereum_wallets',
  'metamask',
  'wallet_connect',
  'coinbase_wallet',
]

const PRIVY_CONFIG: PrivyClientConfig = {
  appearance: {
    accentColor: '#c4996c' as `#${string}`,
    theme: 'light',
    logo: PRIVY_LOGO_URL,
    walletList: PRIVY_WALLET_LIST,
  },
  loginMethods: ['wallet', 'google', 'email'],
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  defaultChain: NETWORK === 'BASE' ? base : baseSepolia,
  supportedChains: [base, baseSepolia, xdc],
}

const PrivyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PrivyRootProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={PRIVY_CONFIG}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
          <ChainProvider>{children}</ChainProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyRootProvider>
  )
}

export default PrivyProvider
