import { ReactNode } from 'react'

import { UsdcIcon } from '@/assets/icons'
import FallbackIcon from '@/assets/icons/tokens/FallbackIcon'

import sdkConfig from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'

export enum SupportedTokens {
  KSU = 'KSU',
  USDC = 'USDC',
  USDT = 'USDT',
}

export type SupportedTokenInfo = {
  name: string
  address: `0x${string}`
  symbol: string
  decimals: number
  icon: ReactNode
}

export const TOKENS = {
  [SupportedChainIds.BASE_SEPOLIA]: {
    [SupportedTokens.KSU]: {
      symbol: 'KSU',
      name: 'Kasu Token',
      address: sdkConfig.contracts.KSUToken as `0x${string}`,
      decimals: 18,
      icon: FallbackIcon(),
    },
    [SupportedTokens.USDC]: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x15B22C46A37e2fFc1135d143fd3d47d889ad13Ff',
      decimals: 6,
      icon: UsdcIcon(),
    },
    [SupportedTokens.USDT]: {
      symbol: 'rKSU',
      name: 'rKasu Token',
      address: '0x2235E1389cC37bdC8086Faeb3abEa3d206fe8E3d',
      decimals: 18,
      icon: FallbackIcon(),
    },
  },
  [SupportedChainIds.BASE]: {
    [SupportedTokens.KSU]: {
      symbol: 'KSU',
      name: 'Kasu Token',
      address: sdkConfig.contracts.KSUToken as `0x${string}`,
      decimals: 18,
      icon: FallbackIcon(),
    },
    [SupportedTokens.USDC]: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x15B22C46A37e2fFc1135d143fd3d47d889ad13Ff',
      decimals: 6,
      icon: UsdcIcon(),
    },
    [SupportedTokens.USDT]: {
      symbol: 'rKSU',
      name: 'rKasu Token',
      address: '0x2235E1389cC37bdC8086Faeb3abEa3d206fe8E3d',
      decimals: 18,
      icon: FallbackIcon(),
    },
  },
} as const satisfies Record<
  SupportedChainIds,
  Record<SupportedTokens, SupportedTokenInfo>
>
