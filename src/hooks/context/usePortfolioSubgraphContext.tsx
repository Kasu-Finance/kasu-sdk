'use client'

import { useContext } from 'react'

import portfolioSubgraphContext from '@/context/portfolioSubgraph/portfolioSubgraph.context'

/**
 * Hook to access user portfolio data from the subgraph context.
 *
 * Must be used within a PortfolioSubgraphProvider.
 *
 * @example
 * const { portfolioData, isLoading } = usePortfolioSubgraphContext()
 *
 * // Get total balance
 * const totalBalance = portfolioData?.totalBalance ?? 0
 *
 * // Get data for a specific pool
 * const poolData = portfolioData?.pools.find(p => p.poolId === poolId)
 *
 * // Get data for a specific tranche
 * const trancheData = portfolioData?.allTranches.find(t => t.trancheId === trancheId)
 */
const usePortfolioSubgraphContext = () => {
  const context = useContext(portfolioSubgraphContext)

  if (context === undefined) {
    throw new Error(
      'usePortfolioSubgraphContext must be used within a PortfolioSubgraphProvider'
    )
  }

  return context
}

export default usePortfolioSubgraphContext
