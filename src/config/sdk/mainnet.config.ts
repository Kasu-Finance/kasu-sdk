import { SdkConfig } from '@solidant/kasu-sdk/src/sdk-config'

import base from '@/config/sdk/addresses-base-mainnet.json'

export const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

export const sdkConfig: SdkConfig = {
  contracts: {
    IKSULockBonus: base.KSULocking.address,
    IKSULocking: base.KSULocking.address,
    KSUToken: base.KSU.address,
    LendingPoolManager: base.LendingPoolManager.address,
    UserManager: base.UserManager.address,
    KasuAllowList: base.KasuAllowList.address,
    SystemVariables: base.SystemVariables.address,
    KsuPrice: base.KsuPrice.address,
    UserLoyaltyRewards: base.UserLoyaltyRewards.address,
    ClearingCoordinator: base.ClearingCoordinator.address,
  },
  directusUrl: 'https://kasu-finance.directus.app/',
  subgraphUrl:
    'https://subgraph.satsuma-prod.com/3ed46ea711d3/kasu-finance--314476/kasu-base/api',
}
