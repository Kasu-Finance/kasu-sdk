import { useContext } from 'react'

import portfolioContext from '@/context/portfolio/portfolio.context'
import { PortfolioTypes } from '@/context/portfolio/portfolio.types'

const usePortfolioState = (): PortfolioTypes => {
  const context = useContext(portfolioContext)

  if (!Object.keys(context).length) {
    throw new Error('PortfolioContext must be used within its provider')
  }

  return context
}

export default usePortfolioState
