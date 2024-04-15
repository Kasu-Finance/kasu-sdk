import { PoolRepayment } from '@solidant/kasu-sdk/src/services/DataService/types'

import { RepaymentsMetrics, SectionKeys } from '@/constants/repayments'

interface MetricMapping {
  id: string
  unit: string
}

interface RepaymentMetric {
  id: string
  content: string | number
  label?: string
  unit: string
}

export interface RepaymentSection {
  metrics: RepaymentMetric[]
}

export interface RepaymentsSections {
  cumulativeFunds: RepaymentSection
  upcomingFunds: RepaymentSection
  transactions: RepaymentSection
  fundsRequest: RepaymentSection
}

const metricsMapping: { [key: string]: MetricMapping } = {
  cumulativeLendingFundsFlow_ClosingLoansBalance: {
    id: RepaymentsMetrics.CLOSING_LOANS,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_OpeningLoansBalance: {
    id: RepaymentsMetrics.OPENING_LOANS,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_LoansDrawn: {
    id: RepaymentsMetrics.LOANS_DRAWN,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_InterestAccrued: {
    id: RepaymentsMetrics.INTEREST_ACCRUED,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_InterestPayments: {
    id: RepaymentsMetrics.INTEREST_PAYMENTS,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_PrincipalRepayments: {
    id: RepaymentsMetrics.PRINCIPAL_REPAYMENTS,
    unit: 'USDC',
  },
  cumulativeLendingFundsFlow_UnrealisedLosses: {
    id: RepaymentsMetrics.UNREALISED_LOSSES,
    unit: 'USDC',
  },
  upcomingLendingFundsFlow_NetInflows: {
    id: RepaymentsMetrics.NET_INFLOWS,
    unit: 'USDC',
  },
  cumulativeDepositsAndWithdrawals_NetDeposits: {
    id: RepaymentsMetrics.NET_DEPOSIT,
    unit: 'USDC',
  },
  cumulativeDepositsAndWithdrawals_CumulativeDeposits: {
    id: RepaymentsMetrics.CUMULATIVE_DEPOSIT,
    unit: 'USDC',
  },
  cumulativeDepositsAndWithdrawals_CumulativeWithdrawals: {
    id: RepaymentsMetrics.CUMULATIVE_WITHDRAW,
    unit: 'USDC',
  },
  depositAndWithdrawalRequests_NetDeposits: {
    id: RepaymentsMetrics.NET_DEPOSITS,
    unit: 'USDC',
  },
  depositAndWithdrawalRequests_CurrentDepositsRequests: {
    id: RepaymentsMetrics.CURRENT_DEPOSITS_REQUESTS,
    unit: 'USDC',
  },
  depositAndWithdrawalRequests_CurrentWithdrawalRequests: {
    id: RepaymentsMetrics.CURRENT_WITHDRAWAL_REQUESTS,
    unit: 'USDC',
  },
}

const formatNumber = (value: any): string => {
  const num = parseFloat(value)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

const getSectionKey = (key: string): SectionKeys | undefined => {
  if (key.includes('cumulativeLendingFundsFlow'))
    return SectionKeys.CumulativeFunds
  if (key.includes('cumulativeDepositsAndWithdrawals'))
    return SectionKeys.Transactions
  if (key.includes('depositAndWithdrawalRequests'))
    return SectionKeys.FundsRequest
  if (key.includes('upcomingLendingFundsFlow')) return SectionKeys.UpcomingFunds
  return undefined
}

const adaptDataForRepayments = (data: PoolRepayment): RepaymentsSections => {
  const sections: RepaymentsSections = {
    cumulativeFunds: { metrics: [] },
    upcomingFunds: { metrics: [] },
    transactions: { metrics: [] },
    fundsRequest: { metrics: [] },
  }

  Object.entries(data).forEach(([key, value]) => {
    if (key.includes('upcomingLendingFundsFlow') && key.endsWith('Key')) {
      const index = key.split('_')[3]
      // TODO: Fix type error
      const label = data[key] || `N/A`
      const valueKey = key.replace('Key', 'Value')
      const metricValue = formatNumber(data[valueKey as keyof PoolRepayment])

      sections.upcomingFunds.metrics.push({
        id: `upcoming_${index}`,
        content: metricValue,
        label,
        unit: 'USDC',
      })
    } else {
      const mapping = metricsMapping[key]
      if (mapping) {
        const formattedValue = formatNumber(value)
        sections[getSectionKey(key) as keyof RepaymentsSections].metrics.push({
          id: mapping.id,
          content: formattedValue,
          unit: mapping.unit,
        })
      }
    }
  })

  return sections
}

export default adaptDataForRepayments
