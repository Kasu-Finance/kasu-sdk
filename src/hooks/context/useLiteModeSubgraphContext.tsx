'use client'

import { useContext } from 'react'

import liteModeSubgraphContext from '@/context/liteModeSubgraph/liteModeSubgraph.context'

/**
 * Hook to access Lite mode data from the subgraph context.
 *
 * Must be used within a LiteModeSubgraphProvider.
 *
 * @example
 * const { liteModeData, isLoading } = useLiteModeSubgraphContext()
 *
 * // Get total balance
 * const totalBalance = liteModeData?.totalBalance ?? 0
 *
 * // Get user locks
 * const userLocks = liteModeData?.userLocks ?? []
 *
 * // Get KSU price
 * const ksuPrice = liteModeData?.systemVariables?.ksuPrice
 */
const useLiteModeSubgraphContext = () => {
  const context = useContext(liteModeSubgraphContext)

  if (context === undefined) {
    throw new Error(
      'useLiteModeSubgraphContext must be used within a LiteModeSubgraphProvider'
    )
  }

  return context
}

export default useLiteModeSubgraphContext
