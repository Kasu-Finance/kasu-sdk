import { createContext } from 'react'

import { LiteModeData } from '@/hooks/lite/useLiteModeSubgraph'

export type LiteModeSubgraphContextValue = {
  /** Lite mode data from subgraph */
  liteModeData: LiteModeData | undefined
  /** True while initial data is loading */
  isLoading: boolean
  /** True while revalidating */
  isValidating: boolean
  /** Error from SWR */
  error: Error | undefined
  /** Function to manually trigger revalidation */
  updateLiteModeData: () => void
}

const liteModeSubgraphContext = createContext<LiteModeSubgraphContextValue>({
  liteModeData: undefined,
  isLoading: false,
  isValidating: false,
  error: undefined,
  updateLiteModeData: () => {},
})

export default liteModeSubgraphContext
