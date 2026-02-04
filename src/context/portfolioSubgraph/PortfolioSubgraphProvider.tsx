'use client'

import React from 'react'

import { useUserPortfolioSubgraph } from '@/hooks/portfolio/useUserPortfolioSubgraph'

import portfolioSubgraphContext from '@/context/portfolioSubgraph/portfolioSubgraph.context'

type PortfolioSubgraphProviderProps = {
  children: React.ReactNode
}

/**
 * Provider that fetches user portfolio data from the subgraph once
 * and makes it available to all child components via context.
 *
 * This replaces multiple RPC calls with a single subgraph query.
 *
 * @example
 * // In a layout or page component
 * <PortfolioSubgraphProvider>
 *   <PortfolioContent />
 * </PortfolioSubgraphProvider>
 *
 * // In child components
 * const { portfolioData } = usePortfolioSubgraphContext()
 */
const PortfolioSubgraphProvider: React.FC<PortfolioSubgraphProviderProps> = ({
  children,
}) => {
  const { portfolioData, isLoading, error, updatePortfolioData } =
    useUserPortfolioSubgraph()

  return (
    <portfolioSubgraphContext.Provider
      value={{
        portfolioData,
        isLoading,
        error,
        updatePortfolioData,
      }}
    >
      {children}
    </portfolioSubgraphContext.Provider>
  )
}

export default PortfolioSubgraphProvider
