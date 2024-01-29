export enum SupportedChainIds {
  MAINNET = 1,
  //   GOERLI = 5,
  ARBITRUM_ONE = 42161,
  BASE_GOERLI = 84531,
  //   ARBITRUM_RINKEBY = 421611,
}

export const AVERAGE_L1_BLOCK_TIME = 12000 // in milliseconds

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainIds.MAINNET]: 'mainnet',
  [SupportedChainIds.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainIds.BASE_GOERLI]: 'base goerli',
} as const
