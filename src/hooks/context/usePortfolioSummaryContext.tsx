import { useContext } from 'react'

import portfolioSummaryContext from '@/context/portfolioSummary/portfolioSummary.context'

const usePortfolioSummaryContext = () => {
  const value = useContext(portfolioSummaryContext)

  if (!value) {
    throw new Error(
      'usePortfolioSummaryContext must be used within PortfolioSummaryProvider'
    )
  }

  return value
}

export default usePortfolioSummaryContext
