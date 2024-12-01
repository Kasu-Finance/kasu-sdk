import { SdkConfig } from '@solidant/kasu-sdk/src/sdk-config'

import sepolia from '@/config/sdk/addresses-base-sepolia.json'

export const USDC = sepolia.USDC.address

export const swapper = sepolia.Swapper.address

export const sdkConfig: SdkConfig = {
  contracts: {
    IKSULockBonus: sepolia.KSULocking.address,
    IKSULocking: sepolia.KSULocking.address,
    KSUToken: sepolia.KSU.address,
    LendingPoolManager: sepolia.LendingPoolManager.address,
    UserManager: sepolia.UserManager.address,
    KasuAllowList: sepolia.KasuAllowList.address,
    SystemVariables: sepolia.SystemVariables.address,
    KsuPrice: sepolia.KsuPrice.address,
    UserLoyaltyRewards: sepolia.UserLoyaltyRewards.address,
    ClearingCoordinator: sepolia.ClearingCoordinator.address,
  },
  directusUrl: 'https://kasu-dev.directus.app/',
  UNUSED_LENDING_POOL_IDS: [''], // will be initialized later
  subgraphUrl:
    'https://subgraph.satsuma-prod.com/3ed46ea711d3/kasu-finance--314476/kasu-sepolia/api',
}
