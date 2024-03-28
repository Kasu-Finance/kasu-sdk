import { SdkConfig } from 'kasu-sdk/src/sdk-config'

export const USDC = '0x052CC9939E9845ae2B0228047F95c647c8050896'

export const sdkConfig: SdkConfig = {
  contracts: {
    IKSULockBonus: '0xfb6bd945A4eB3b25F857302fB091a962b8ddF395',
    IKSULocking: '0x90BDD195c0EB715D4Fb2359500f55eCac1EfD364',
    KSUToken: '0xE381591805f9AD4E8dCc5D932e57C4773629eB47',
    LendingPoolManager: '0x86A57D35bB265cE833e4E131A39672dCBD1Db798',
    UserManager: '0x743ad4f80dfa699C8650eF60eB087E4347e5F7Ea',
  },
  subgraphUrl:
    'https://api.studio.thegraph.com/query/63245/kasu-wip-sepolia/version/latest',
  directusUrl: 'https://kasu-finance.directus.app/',
}
