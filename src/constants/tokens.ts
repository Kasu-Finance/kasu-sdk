import { ReactNode } from 'react'

import { UsdCoinIcon, UsdCoinLightIcon } from '@/assets/icons'

import { USDC } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'

export enum SupportedTokens {
  USDC = 'USDC',
}

export type SupportedTokenInfo = {
  name: string
  address: `0x${string}`
  symbol: SupportedTokens
  decimals: number
  icon: {
    dark: ReactNode
    light: ReactNode
  }
}

export const TOKENS = {
  [SupportedChainIds.BASE_SEPOLIA]: {
    [SupportedTokens.USDC]: {
      symbol: SupportedTokens.USDC,
      name: 'USD Coin',
      address: USDC as `0x${string}`,
      decimals: 6,
      icon: {
        dark: UsdCoinIcon(),
        light: UsdCoinLightIcon(),
      },
    },
  },
  [SupportedChainIds.BASE]: {
    [SupportedTokens.USDC]: {
      symbol: SupportedTokens.USDC,
      name: 'USD Coin',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      icon: {
        dark: UsdCoinIcon(),
        light: UsdCoinLightIcon(),
      },
    },
  },
} as const satisfies Record<
  SupportedChainIds,
  Record<SupportedTokens, SupportedTokenInfo>
>
