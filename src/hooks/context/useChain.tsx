import { useContext } from 'react'

import { ChainContext } from '@/context/chain/chain.context'

/**
 * Hook to access chain context.
 * Provides current chain state and feature flags.
 *
 * @example
 * const { currentChainId, isLiteDeployment, hasKsuToken, switchChain } = useChain()
 *
 * // Conditionally render based on chain features
 * {hasKsuToken && <LockingSection />}
 */
export const useChain = () => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('useChain must be used within ChainProvider')
  }
  return context
}
