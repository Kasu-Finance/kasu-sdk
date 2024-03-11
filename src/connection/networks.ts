import { SupportedChainIds } from './chains'
import { RPC_URLS } from './rpc'

export type ChainDetails = {
  label?: string
  chainId: SupportedChainIds
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export const networks: Record<SupportedChainIds, ChainDetails> = {
  [SupportedChainIds.MAINNET]: {
    chainId: SupportedChainIds.MAINNET,
    chainName: 'Mainnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: RPC_URLS[SupportedChainIds.MAINNET],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  [SupportedChainIds.ARBITRUM_ONE]: {
    chainId: SupportedChainIds.ARBITRUM_ONE,
    chainName: 'Arbitrum One',
    label: 'Arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://arbiscan.io'],
    rpcUrls: RPC_URLS[SupportedChainIds.ARBITRUM_ONE],
  },
  [SupportedChainIds.BASE_SEPOLIA]: {
    chainId: SupportedChainIds.BASE_SEPOLIA,
    chainName: 'Base Sepolia',
    label: 'Base Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://sepolia.basescan.org'],
    rpcUrls: RPC_URLS[SupportedChainIds.BASE_SEPOLIA],
  },
}
