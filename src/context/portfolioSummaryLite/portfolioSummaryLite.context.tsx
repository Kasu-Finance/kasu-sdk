'use client'

import { PortfolioSummary } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { createContext } from 'react'

export type PortfolioSummaryLiteContextValue = {
  portfolioSummary?: PortfolioSummary
  isLoading: boolean
  error?: unknown
  updatePortfolioSummary: () => Promise<PortfolioSummary | undefined>
}

const portfolioSummaryLiteContext =
  createContext<PortfolioSummaryLiteContextValue | null>(null)

export default portfolioSummaryLiteContext
