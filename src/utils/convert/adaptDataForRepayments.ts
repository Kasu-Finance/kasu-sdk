import { PoolRepayment } from '@solidant/kasu-sdk/src/services/DataService/types'

import { RepaymentsMetrics } from '@/constants/repayments'

import { PoolMetric } from '@/types/lending'

interface MetricMapping {
  id: string
  unit: string
}

export interface RepaymentSection {
  metrics: PoolMetric[]
}

export interface RepaymentsSections {
  cumulativeFunds: RepaymentSection
  upcomingFunds: RepaymentSection
}

// Map backend data keys to frontend schema using intuitive names that align with translation keys in en.json
const metricsMapping: { [key: string]: MetricMapping } = {
  cumulativeLendingFundsFlow_ClosingLoansBalance: {
    id: RepaymentsMetrics.ClosingLoans,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_OpeningLoansBalance: {
    id: RepaymentsMetrics.OpeningLoans,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_LoansDrawn: {
    id: RepaymentsMetrics.LoansDrawn,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_InterestAccrued: {
    id: RepaymentsMetrics.InterestAccrued,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_InterestPayments: {
    id: RepaymentsMetrics.InterestPayments,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_PrincipalRepayments: {
    id: RepaymentsMetrics.PrincipalRepayments,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_UnrealisedLosses: {
    id: RepaymentsMetrics.UnrealisedLosses,
    unit: 'USDC',
  },
  upcomingLendingFundsFlow_NetInflows: {
    id: RepaymentsMetrics.NetInflows,
    unit: 'USDC',
  },
}

const adaptDataForRepayments = (data: PoolRepayment): RepaymentsSections => {
  const cumulativeFunds: RepaymentSection = {
    metrics: [],
  }

  const upcomingFunds: RepaymentSection = {
    metrics: [],
  }

  Object.entries(data).forEach(([key, value]) => {
    const mapping = metricsMapping[key as keyof typeof metricsMapping]
    if (mapping) {
      const metric: PoolMetric = {
        id: mapping.id,
        content: value ?? 'N/A',
        unit: mapping.unit,
      }
      if (key.startsWith('cumulative')) {
        cumulativeFunds.metrics.push(metric)
      } else if (key.startsWith('upcoming')) {
        upcomingFunds.metrics.push(metric)
      }
    }
  })

  // closingLoans metric should be displayed first
  cumulativeFunds.metrics.sort((a, b) =>
    a.id === RepaymentsMetrics.ClosingLoans
      ? -1
      : b.id === RepaymentsMetrics.ClosingLoans
        ? 1
        : 0
  )
  // netInflows metric should be displayed first
  upcomingFunds.metrics.sort((a, b) =>
    a.id === RepaymentsMetrics.NetInflows
      ? -1
      : b.id === RepaymentsMetrics.NetInflows
        ? 1
        : 0
  )

  return {
    cumulativeFunds,
    upcomingFunds,
  }
}

export default adaptDataForRepayments
