'use client'

import { PrivyProvider as PrivyRootProvider } from '@privy-io/react-auth'
import { createConfig, WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { http } from 'wagmi'

import { NETWORK } from '@/config/sdk'

const queryClient = new QueryClient()

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

// const privyConfig: PrivyClientConfig =

const PrivyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PrivyRootProvider
      appId='cm9b83y3g01xuk00nikfufifi'
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#c4996c',
          logo: 'https://your-logo-url',
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
