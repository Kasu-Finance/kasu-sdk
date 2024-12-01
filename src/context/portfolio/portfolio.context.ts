import { createContext } from 'react'

import { PortfolioTypes } from '@/context/portfolio/portfolio.types'

const portfolioContext = createContext({} as PortfolioTypes)
portfolioContext.displayName = 'Portfolio'

export default portfolioContext
