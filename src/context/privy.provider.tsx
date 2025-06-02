'use client'

import { PrivyProvider as PrivyRootProvider } from '@privy-io/react-auth'
import { createConfig, WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { http } from 'wagmi'

import { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

const queryClient = new QueryClient()

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(RPC_URLS[SupportedChainIds.BASE][0]),
    [baseSepolia.id]: http(RPC_URLS[SupportedChainIds.BASE_SEPOLIA][0]),
  },
})

// const privyConfig: PrivyClientConfig =

const PrivyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PrivyRootProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#c4996c',
          logo: 'https://kasu-finance.directus.app/assets/3113809a-887f-4b8a-b5f9-ef9d1d1abd74.png',
          showWalletLoginFirst: true,
          walletList: [
            'metamask',
            'coinbase_wallet',
            'wallet_connect',
            'detected_ethereum_wallets',
          ],
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: NETWORK === 'BASE' ? base : baseSepolia,
        supportedChains: [base, baseSepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyRootProvider>
  )
}

export default PrivyProvider
