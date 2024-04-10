type Token = {
  symbol: string
  address: string
  decimals?: number
}

export const TOKENS: Record<string, Token> = {
  KSU: {
    symbol: 'KSU',
    address: '...',
    decimals: 6,
  },
  USDC: {
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 2,
  },
  USDT: {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  WETH: {
    symbol: 'WETH',
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
}
