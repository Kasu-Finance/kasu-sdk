import { createContext } from 'react'

import {
  ChainConfig,
  DEFAULT_CHAIN_ID,
  SUPPORTED_CHAINS,
} from '@/config/chains'

/**
 * Chain context value providing current chain state and feature flags.
 */
export interface ChainContextValue {
  /** Current chain ID */
  currentChainId: number
  /** Full chain configuration */
  chainConfig: ChainConfig

  /** Whether this chain is a Lite deployment (no KSU token) */
  isLiteDeployment: boolean
  /** Whether KSU token features are available */
  hasKsuToken: boolean
  /** Whether locking features are available */
  hasLocking: boolean
  /** Whether loyalty features are available */
  hasLoyalty: boolean
  /** Whether NFT features are available */
  hasNfts: boolean

  /** Switch to a different chain */
  switchChain: (chainId: number) => Promise<void>
  /** Whether a chain switch is in progress */
  isSwitchingChain: boolean

  /** All supported chains for UI display */
  supportedChains: ChainConfig[]
}

const defaultChainConfig = SUPPORTED_CHAINS[DEFAULT_CHAIN_ID]

export const ChainContext = createContext<ChainContextValue>({
  currentChainId: DEFAULT_CHAIN_ID,
  chainConfig: defaultChainConfig,
  isLiteDeployment: defaultChainConfig.isLiteDeployment,
  hasKsuToken: !defaultChainConfig.isLiteDeployment,
  hasLocking: !defaultChainConfig.isLiteDeployment,
  hasLoyalty: !defaultChainConfig.isLiteDeployment,
  hasNfts: !defaultChainConfig.isLiteDeployment,
  switchChain: async () => {},
  isSwitchingChain: false,
  supportedChains: Object.values(SUPPORTED_CHAINS),
})

ChainContext.displayName = 'ChainContext'
