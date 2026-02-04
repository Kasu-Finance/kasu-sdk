'use client'

import React from 'react'

import { useLiteModeSubgraph } from '@/hooks/lite/useLiteModeSubgraph'

import liteModeSubgraphContext from '@/context/liteModeSubgraph/liteModeSubgraph.context'

type LiteModeSubgraphProviderProps = {
  children: React.ReactNode
}

/**
 * Provider that fetches all Lite mode data from the subgraph once
 * and makes it available to all child components via context.
 *
 * This replaces ~15 sequential RPC calls with 1 subgraph query.
 */
const LiteModeSubgraphProvider: React.FC<LiteModeSubgraphProviderProps> = ({
  children,
}) => {
  const { liteModeData, isLoading, isValidating, error, updateLiteModeData } =
    useLiteModeSubgraph()

  return (
    <liteModeSubgraphContext.Provider
      value={{
        liteModeData,
        isLoading,
        isValidating,
        error,
        updateLiteModeData,
      }}
    >
      {children}
    </liteModeSubgraphContext.Provider>
  )
}

export default LiteModeSubgraphProvider
