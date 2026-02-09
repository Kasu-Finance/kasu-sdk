import { SdkConfig } from '@kasufinance/kasu-sdk'

import sepolia from '@/config/sdk/addresses-base-sepolia.json'

export const USDC = sepolia.USDC.address

export const sdkConfig = new SdkConfig({
  subgraphUrl:
    'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-sepolia/v0.0.42/gn',
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
    KasuNFTs: sepolia.KasuNFTs.address,
    ExternalTVL: sepolia.ExternalTVL.address,
  },
  directusUrl: 'https://kasu-dev.directus.app/',
  UNUSED_LENDING_POOL_IDS: [''], // will be initialized later
})
