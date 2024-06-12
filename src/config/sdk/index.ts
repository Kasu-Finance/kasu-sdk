import { SdkConfig } from '@solidant/kasu-sdk/src/sdk-config'

import * as mainnetConfig from './mainnet.config'
import * as testnetConfig from './testnet.config'

interface Config {
  sdkConfig: SdkConfig
  USDC: string
}

const NETWORK = (process.env.NEXT_PUBLIC_CURRENT_NETWORK || 'TESTNET') as
  | 'TESTNET'
  | 'BASE'

const SDK_CONFIG: Record<typeof NETWORK, Config> = {
  BASE: mainnetConfig,
  TESTNET: testnetConfig,
}

const config = SDK_CONFIG[NETWORK]

const sdkConfig = config.sdkConfig

export const USDC = config.USDC

export default sdkConfig
