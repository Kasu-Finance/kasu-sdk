import * as mainnetConfig from './mainnet.config'
import * as testnetConfig from './testnet.config'

const useTestNet = true

const config = useTestNet ? testnetConfig : mainnetConfig

const sdkConfig = config.sdkConfig

export const USDC = config.USDC

export default sdkConfig
