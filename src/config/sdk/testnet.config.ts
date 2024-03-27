import { SdkConfig } from 'kasu-sdk/src/sdk-config'

export const USDC = '0x5Da3EA3A64c731ab74aC12D1593D454769eA0252'

export const sdkConfig: SdkConfig = {
  contracts: {
    IKSULockBonus: '0x068a06E7c9d864E77d8c65415407e948eB1A49d9',
    IKSULocking: '0x2235E1389cC37bdC8086Faeb3abEa3d206fe8E3d',
    KSUToken: '0x97EC1504E3a92BfAff98D25fE11F0fa4Ae08533b',
  },
  subgraphUrl:
    'https://api.studio.thegraph.com/query/63245/kasu-wip-sepolia/version/latest',
  directusUrl: 'https://kasu-finance.directus.app/',
}
