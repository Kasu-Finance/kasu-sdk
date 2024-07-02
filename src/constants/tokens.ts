import { ethers } from 'ethers'
import { ReactNode } from 'react'

import {
  AerodomeIcon,
  BenjiIcon,
  BrettIcon,
  CoinbaseWrappedStakedEtherIcon,
  DegenIcon,
  EtherIcon,
  UsdBaseCoinIcon,
  USDCoinIcon,
  WrappedEtherIcon,
} from '@/assets/icons'

import { SupportedChainIds } from '@/connection/chains'

export enum SupportedTokens {
  WETH = 'WETH',
  ETH = 'ETH',
  USDC = 'USDC',
  AERO = 'AERO',
  BRETT = 'BRETT',
  BENJI = 'BENJI',
  DEGEN = 'DEGEN',
  USDBC = 'USDbC',
  // WSTETH = 'WSTETH',
  CBETH = 'cbETH',
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
    [SupportedTokens.AERO]: {
      symbol: SupportedTokens.AERO,
      name: 'Aerodrome',
      address: ethers.constants.AddressZero,
      decimals: 18,
      icon: AerodomeIcon(),
    },
    [SupportedTokens.BRETT]: {
      symbol: SupportedTokens.BRETT,
      name: 'Brett',
      address: ethers.constants.AddressZero,
      decimals: 18,
      icon: BrettIcon(),
    },
    [SupportedTokens.BENJI]: {
      symbol: SupportedTokens.BENJI,
      name: 'Basenji',
      address: ethers.constants.AddressZero,
      decimals: 18,
      icon: BenjiIcon(),
    },
    [SupportedTokens.DEGEN]: {
      symbol: SupportedTokens.DEGEN,
      name: 'Degen',
      address: ethers.constants.AddressZero,
      decimals: 18,
      icon: DegenIcon(),
    },
    [SupportedTokens.USDBC]: {
      symbol: SupportedTokens.USDBC,
      name: 'USD Base Coin',
      address: ethers.constants.AddressZero,
      decimals: 6,
      icon: UsdBaseCoinIcon(),
    },
    // [SupportedTokens.WSTETH]: {
    //   symbol: SupportedTokens.WSTETH,
    //   name: 'Wrapped liquid staked Ether 2.0',
    //   address: ethers.constants.AddressZero,
    //   decimals: 18,
    //   icon: WrappedLiquidStakedEtherIcon(),
    // },
    [SupportedTokens.CBETH]: {
      symbol: SupportedTokens.CBETH,
      name: 'Coinbase Wrapped Staked ETH',
      address: ethers.constants.AddressZero,
      decimals: 18,
      icon: CoinbaseWrappedStakedEtherIcon(),
    },
  },
  [SupportedChainIds.BASE]: {
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
    [SupportedTokens.AERO]: {
      symbol: SupportedTokens.AERO,
      name: 'Aerodrome',
      address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
      decimals: 18,
      icon: AerodomeIcon(),
    },
    [SupportedTokens.BRETT]: {
      symbol: SupportedTokens.BRETT,
      name: 'Brett',
      address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
      decimals: 18,
      icon: BrettIcon(),
    },
    [SupportedTokens.BENJI]: {
      symbol: SupportedTokens.BENJI,
      name: 'Basenji',
      address: '0xBC45647eA894030a4E9801Ec03479739FA2485F0',
      decimals: 18,
      icon: BenjiIcon(),
    },
    [SupportedTokens.DEGEN]: {
      symbol: SupportedTokens.DEGEN,
      name: 'Degen',
      address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
      decimals: 18,
      icon: DegenIcon(),
    },
    [SupportedTokens.USDBC]: {
      symbol: SupportedTokens.USDBC,
      name: 'USD Base Coin',
      address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      decimals: 6,
      icon: UsdBaseCoinIcon(),
    },
    // [SupportedTokens.WSTETH]: {
    //   symbol: SupportedTokens.WSTETH,
    //   name: 'Wrapped liquid staked Ether 2.0',
    //   address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
    //   decimals: 18,
    //   icon: WrappedLiquidStakedEtherIcon(),
    // },
    [SupportedTokens.CBETH]: {
      symbol: SupportedTokens.CBETH,
      name: 'Coinbase Wrapped Staked ETH',
      address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
      decimals: 18,
      icon: CoinbaseWrappedStakedEtherIcon(),
    },
  },
} as const satisfies Record<
  SupportedChainIds,
  Record<SupportedTokens, SupportedTokenInfo>
>
