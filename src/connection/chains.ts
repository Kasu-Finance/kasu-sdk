// TODO: ADAPT SUPPORTED CHAINS WHEN DEPLOYING TO MAINET
export enum SupportedChainIds {
  MAINNET = 0, // TODO: return to "1" instead of "0" when deploying to mainnet
  //   GOERLI = 5,
  ARBITRUM_ONE = 42161,
  BASE_SEPOLIA = 84532,
  //   ARBITRUM_RINKEBY = 421611,
}

export const AVERAGE_L1_BLOCK_TIME = 12000 // in milliseconds

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainIds.MAINNET]: 'mainnet',
  [SupportedChainIds.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainIds.BASE_SEPOLIA]: 'base sepolia',
} as const
