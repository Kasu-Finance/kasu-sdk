import { SdkConfig } from '@solidant/kasu-sdk/src/sdk-config'

import base from '@/config/sdk/addresses-base-mainnet.json'

export const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

export const swapper = base.Swapper.address

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
    KasuNFTs: base.KasuNFTs.address,
  },
  UNUSED_LENDING_POOL_IDS: [''], // will be initialized later
  directusUrl: 'https://kasu-finance.directus.app/',
  subgraphUrl:
    'https://subgraph.satsuma-prod.com/3ed46ea711d3/kasu-finance--314476/kasu-base/api',
  plumeSubgraphUrl:
    'https://api.goldsky.com/api/public/project_cm9t3064xeuyn01tgctdo3c17/subgraphs/kasu-plume/prod/gn',
}
