export const BASE_MAINNET = 8453

export enum SupportedChainIds {
  MAINNET = BASE_MAINNET,
  //   GOERLI = 5,
  // ARBITRUM_ONE = 42161,
  BASE_SEPOLIA = 84532,
  //   ARBITRUM_RINKEBY = 421611,
}

export const AVERAGE_L1_BLOCK_TIME = 12000 // in milliseconds

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainIds.MAINNET]: 'base',
  // [SupportedChainIds.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainIds.BASE_SEPOLIA]: 'base sepolia',
} as const
