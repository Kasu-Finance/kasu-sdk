import { SupportedChainIds } from './chains'

export const FALLBACK_URLS: Record<SupportedChainIds, string[]> = {
  [SupportedChainIds.BASE]: ['https://mainnet.base.org'],
  [SupportedChainIds.BASE_SEPOLIA]: ['https://sepolia.base.org'],
}

export const RPC_URLS: Record<SupportedChainIds, string[]> = {
  [SupportedChainIds.BASE]: [
    'https://mainnet.base.org',
    ...FALLBACK_URLS[SupportedChainIds.BASE],
  ],
  [SupportedChainIds.BASE_SEPOLIA]: [
    'https://sepolia.base.org',
    ...FALLBACK_URLS[SupportedChainIds.BASE_SEPOLIA],
  ],
}
