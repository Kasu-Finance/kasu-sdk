import { SdkConfig } from '@solidant/kasu-sdk/src/sdk-config'

import sepolia from '@/config/sdk/addresses-base-sepolia.json'

export const USDC = sepolia.USDC.address

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
  },
  directusUrl: 'https://kasu-finance.directus.app/',
  subgraphUrl:
    'https://api.studio.thegraph.com/query/63245/kasu-wip-sepolia/version/latest',
}
