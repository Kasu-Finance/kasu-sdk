'use client'

import { PortfolioSummary } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { createContext } from 'react'

export type PortfolioSummaryContextValue = {
  portfolioSummary?: PortfolioSummary
  isLoading: boolean
  error?: unknown
  updatePortfolioSummary: () => Promise<PortfolioSummary | undefined>
}

const portfolioSummaryContext =
  createContext<PortfolioSummaryContextValue | null>(null)

export default portfolioSummaryContext
