import { KasuSdk } from '@kasufinance/kasu-sdk'
import { createContext } from 'react'

export interface SdkContextValue {
  sdk: KasuSdk | undefined
  /** True when chain is switching and SDK is being recreated */
  isChainTransitioning: boolean
}

const sdkContext = createContext<SdkContextValue>({
  sdk: undefined,
  isChainTransitioning: false,
})
sdkContext.displayName = 'SdkContext'

export default sdkContext
