export const BASE_MAINNET = 8453
export const XDC_MAINNET = 50

export enum SupportedChainIds {
  // MAINNET = 1,
  // GOERLI = 5,
  // ARBITRUM_ONE = 42161,
  BASE = 8453,
  BASE_SEPOLIA = 84532,
  XDC = 50,
  // ARBITRUM_RINKEBY = 421611,
}

export const AVERAGE_L1_BLOCK_TIME = 12000 // in milliseconds

export const CHAIN_IDS_TO_NAMES = {
  // [SupportedChainIds.MAINNET]: 'mainnet',
  // [SupportedChainIds.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainIds.BASE]: 'base',
  [SupportedChainIds.BASE_SEPOLIA]: 'base sepolia',
  [SupportedChainIds.XDC]: 'xdc',
} as const
