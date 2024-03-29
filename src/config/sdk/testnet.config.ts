import { SdkConfig } from 'kasu-sdk/src/sdk-config'

export const USDC = '0x1d3c92431588B97270b75a05C61635E2B610fe79'

export const sdkConfig: SdkConfig = {
  contracts: {
    IKSULockBonus: '0x1CB17c6C9CaFF60296fb92C17651839ae1964d0A',
    IKSULocking: '0x58E41447cd0e9f73f23e6a355D4788edB98CEC1b',
    KSUToken: '0x86a06FF8373Bb5b26f9E4C3E93aEEA9f7F1438cC',
    LendingPoolManager: '0x2C0068dc279Dc6459988523513EF722602566710',
    UserManager: '0x735AAA920725395E224e7d4e9524B5bcF5C59eEE',
    KasuAllowList: '0x66E4a81F7f9eef1713b0f51e868baE15955B1dF0',
  },
  directusUrl: 'https://kasu-finance.directus.app/',
  subgraphUrl:
    'https://api.studio.thegraph.com/query/63245/kasu-wip-sepolia/version/latest',
}
