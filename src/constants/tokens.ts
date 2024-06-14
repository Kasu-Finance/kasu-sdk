import { ReactNode } from 'react'

import { EtherIcon, USDCoinIcon, WrappedEtherIcon } from '@/assets/icons'

import { SupportedChainIds } from '@/connection/chains'

export enum SupportedTokens {
  WETH = 'WETH',
  ETH = 'ETH',
  USDC = 'USDC',
  // DAI = 'DAI',
}

export type SupportedTokenInfo = {
  name: string
  address: `0x${string}`
  symbol: SupportedTokens
  decimals: number
  icon: ReactNode
}

export const TOKENS = {
  [SupportedChainIds.BASE_SEPOLIA]: {
    // [SupportedTokens.DAI]: {
    //   symbol: SupportedTokens.DAI,
    //   name: 'Dai Stablecoin',
    //   address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    //   decimals: 18,
    //   icon: FallbackIcon(),
    // },
    [SupportedTokens.USDC]: {
      symbol: SupportedTokens.USDC,
      name: 'USD Coin',
      address: '0x15B22C46A37e2fFc1135d143fd3d47d889ad13Ff',
      decimals: 6,
      icon: USDCoinIcon(),
    },
    [SupportedTokens.ETH]: {
      symbol: SupportedTokens.ETH,
      name: 'Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      icon: EtherIcon(),
    },
    [SupportedTokens.WETH]: {
      symbol: SupportedTokens.WETH,
      name: 'Wrapped Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      icon: WrappedEtherIcon(),
    },
  },
  [SupportedChainIds.BASE]: {
    // [SupportedTokens.DAI]: {
    //   symbol: SupportedTokens.DAI,
    //   name: 'Dai Stablecoin',
    //   address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    //   decimals: 18,
    //   icon: FallbackIcon(),
    // },
    [SupportedTokens.USDC]: {
      symbol: SupportedTokens.USDC,
      name: 'USD Coin',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      icon: USDCoinIcon(),
    },
    [SupportedTokens.ETH]: {
      symbol: SupportedTokens.ETH,
      name: 'Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      icon: EtherIcon(),
    },
    [SupportedTokens.WETH]: {
      symbol: SupportedTokens.WETH,
      name: 'Wrapped Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      icon: WrappedEtherIcon(),
    },
  },
} as const satisfies Record<
  SupportedChainIds,
  Record<SupportedTokens, SupportedTokenInfo>
>
