import { SupportedChainIds } from './chains'

const INFURA_KEY = 'b988a742181345dcb8d245aab3a78ab1'

export const FALLBACK_URLS: Record<SupportedChainIds, string[]> = {
  [SupportedChainIds.BASE]: ['https://mainnet.base.org'],
  [SupportedChainIds.BASE_SEPOLIA]: ['https://sepolia.base.org'],
}

export const RPC_URLS: Record<SupportedChainIds, string[]> = {
  [SupportedChainIds.BASE]: [
    `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainIds.BASE],
  ],
  [SupportedChainIds.BASE_SEPOLIA]: [
    'https://sepolia.base.org',
    ...FALLBACK_URLS[SupportedChainIds.BASE_SEPOLIA],
  ],
}
