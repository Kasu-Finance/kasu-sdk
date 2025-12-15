import { useContext } from 'react'

import portfolioSummaryLiteContext from '@/context/portfolioSummaryLite/portfolioSummaryLite.context'

const usePortfolioSummaryLite = () => {
  const value = useContext(portfolioSummaryLiteContext)

  if (!value) {
    throw new Error(
      'usePortfolioSummaryLite must be used within PortfolioSummaryLiteProvider'
    )
  }

  return value
}

export default usePortfolioSummaryLite
