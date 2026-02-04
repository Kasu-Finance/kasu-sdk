import { createContext } from 'react'

import { UserPortfolioData } from '@/hooks/portfolio/useUserPortfolioSubgraph'

export type PortfolioSubgraphContextValue = {
  /** User portfolio data from subgraph */
  portfolioData: UserPortfolioData | null | undefined
  /** True while initial data is loading */
  isLoading: boolean
  /** Error from SWR */
  error: Error | undefined
  /** Function to manually trigger revalidation */
  updatePortfolioData: () => void
}

const portfolioSubgraphContext = createContext<PortfolioSubgraphContextValue>({
  portfolioData: undefined,
  isLoading: false,
  error: undefined,
  updatePortfolioData: () => {},
})

export default portfolioSubgraphContext
