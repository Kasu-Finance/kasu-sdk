'use client'

import { ReactNode, useReducer } from 'react'

import usePortfolioActions from '@/context/portfolio/portfolio.actions'
import PortfolioContext from '@/context/portfolio/portfolio.context'
import portfolioReducer from '@/context/portfolio/portfolio.reducer'
import { PortfolioStateType } from '@/context/portfolio/portfolio.types'
import { PortfolioSubgraphProvider } from '@/context/portfolioSubgraph'

type PortfolioStateProps = {
  children: ReactNode
}

const initialState: PortfolioStateType = {
  filter: {
    activePools: true,
    closedPools: false,
  },
}

const PortfolioState: React.FC<PortfolioStateProps> = ({ children }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState)

  const portfolioActions = usePortfolioActions(dispatch)

  return (
    <PortfolioContext.Provider value={{ ...state, ...portfolioActions }}>
      <PortfolioSubgraphProvider>{children}</PortfolioSubgraphProvider>
    </PortfolioContext.Provider>
  )
}

export default PortfolioState
