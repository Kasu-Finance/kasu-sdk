import { KasuSdk } from '@kasufinance/kasu-sdk'
import { createContext } from 'react'

const sdkContext = createContext({} as { sdk: KasuSdk | undefined })
sdkContext.displayName = 'SdkContext'

export default sdkContext
