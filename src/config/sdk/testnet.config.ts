import { SdkConfig } from 'kasu-sdk/src/sdk-config'

export const USDC = '0x1Da2378f507FF1dD5E61801453C07bF614e214d4'

export const sdkConfig: SdkConfig = {
  contracts: {
    IKSULockBonus: '0x17Db2d008eA35A935DEe331a1501582c57Ac609B',
    IKSULocking: '0xD61E549E7a269171Efca755577e3b7959915cA21',
    KSUToken: '0x8A883a8Efb45AC1A2873287712010a7d95f52975',
  },
  subgraphUrl:
    'https://api.studio.thegraph.com/query/63245/kasu-wip-sepolia/version/latest',
}
