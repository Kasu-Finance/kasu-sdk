import { SupportedChainIds } from './chains'

const INFURA_KEY = 'b988a742181345dcb8d245aab3a78ab1'

export const FALLBACK_URLS: Record<SupportedChainIds, string[]> = {
  [SupportedChainIds.MAINNET]: [
    // "Safe" URLs
    // ...
    // "Fallback" URLs
    'https://rpc.ankr.com/eth',
    'https://eth-mainnet.public.blastapi.io',
  ],
  [SupportedChainIds.ARBITRUM_ONE]: [
    // "Safe" URLs
    'https://arb1.arbitrum.io/rpc',
    // "Fallback" URLs
    'https://arbitrum.public-rpc.com',
  ],
  [SupportedChainIds.BASE_SEPOLIA]: ['https://sepolia.base.org'],
}

export const RPC_URLS: Record<SupportedChainIds, string[]> = {
  [SupportedChainIds.MAINNET]: [
    `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    // QUICKNODE_MAINNET_RPC_URL,
    ...FALLBACK_URLS[SupportedChainIds.MAINNET],
  ],
  [SupportedChainIds.ARBITRUM_ONE]: [
    `https://base-mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainIds.ARBITRUM_ONE],
  ],
  [SupportedChainIds.BASE_SEPOLIA]: [
    'https://sepolia.base.org',
    ...FALLBACK_URLS[SupportedChainIds.BASE_SEPOLIA],
  ],
}
