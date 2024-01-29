import { SdkConfig } from 'kasu-sdk/src/sdk-config'

export const USDC = '0x6642F771951d8b70f5d2F787334d62C9a4DF1F53'

export const sdkConfig: SdkConfig = {
  contracts: {
    IKSULockBonus: '0x07baFe0dE4BD63508459c53d9Cde8099f4cB201F',
    IKSULocking: '0xc8f16b0CCBe8009c11CcC7C8DC1779907a79c846',
    KSUToken: '0x35281D21C6755cd3360031fAe526A0Dc9290E845',
  },
  subgraphUrl:
    'https://api.studio.thegraph.com/query/63245/kasu-testnet/version/latest',
}
