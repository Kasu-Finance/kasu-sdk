import { PoolRepayment } from '@solidant/kasu-sdk/src/services/DataService/types'

import { RepaymentsMetrics, SectionKeys } from '@/constants/repayments'
import formatAmount from '@/utils/formats/formatAmount'

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

interface MetricMapping {
  id: string
  unit: string
}

const staticMetricsMapping: { [key: string]: MetricMapping } = {
  cumulativeLendingFundsFlow_ClosingLoansBalance: {
    id: RepaymentsMetrics.CLOSING_LOANS,
    unit: 'USD',
  },
  cumulativeLendingFundsFlow_OpeningLoansBalance: {
    id: RepaymentsMetrics.OPENING_LOANS,
    unit: 'USD',
  },
  cumulativeLendingFundsFlow_LoansDrawn: {
    id: RepaymentsMetrics.LOANS_DRAWN,
    unit: 'USD',
  },
  cumulativeLendingFundsFlow_InterestAccrued: {
    id: RepaymentsMetrics.INTEREST_ACCRUED,
    unit: 'USD',
  },
  cumulativeLendingFundsFlow_InterestPayments: {
    id: RepaymentsMetrics.INTEREST_PAYMENTS,
    unit: 'USD',
  },
  cumulativeLendingFundsFlow_PrincipalRepayments: {
    id: RepaymentsMetrics.PRINCIPAL_REPAYMENTS,
    unit: 'USD',
  },
  cumulativeLendingFundsFlow_UnrealisedLosses: {
    id: RepaymentsMetrics.UNREALISED_LOSSES,
    unit: 'USD',
  },
  upcomingLendingFundsFlow_NetInflows: {
    id: RepaymentsMetrics.NET_INFLOWS,
    unit: 'USD',
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

function sortCumulativeFundsMetrics(metrics: RepaymentMetric[]): void {
  const order = [
    RepaymentsMetrics.CLOSING_LOANS,
    RepaymentsMetrics.OPENING_LOANS,
    RepaymentsMetrics.LOANS_DRAWN,
    RepaymentsMetrics.INTEREST_ACCRUED,
    RepaymentsMetrics.INTEREST_PAYMENTS,
    RepaymentsMetrics.PRINCIPAL_REPAYMENTS,
    RepaymentsMetrics.UNREALISED_LOSSES,
  ]

  metrics.sort(
    (a, b) =>
      order.indexOf(a.id as RepaymentsMetrics) -
      order.indexOf(b.id as RepaymentsMetrics)
  )
}

function sortUpcomingFundsMetrics(metrics: RepaymentMetric[]): void {
  const firstId = RepaymentsMetrics.NET_INFLOWS
  metrics.sort((a, b) => (a.id === firstId ? -1 : b.id === firstId ? 1 : 0))
}

function handleDynamicMetric(
  key: string,
  data: PoolRepayment,
  sections: RepaymentsSections
): void {
  const label = data[key as keyof typeof data]

  if (!label) return

  const valueKey = key.replace('Key', 'Value') as keyof typeof data
  const metricValue = formatAmount(String(data[valueKey]), { minDecimals: 2 })

  sections.upcomingFunds.metrics.push({
    id: key,
    content: metricValue,
    label: label.toString(),
    unit: 'USD',
  })
}

function handleStaticMetric(
  key: string,
  data: PoolRepayment,
  sections: RepaymentsSections
): void {
  const mapping = staticMetricsMapping[key]
  if (mapping) {
    const formattedValue = formatAmount(
      String(data[key as keyof typeof data]),
      { minDecimals: 2 }
    )
    const sectionKey = getSectionKey(key)
    if (sectionKey) {
      sections[sectionKey].metrics.push({
        id: mapping.id,
        content: formattedValue,
        unit: mapping.unit,
      })
    }
  }
}

const adaptDataForRepayments = (data: PoolRepayment): RepaymentsSections => {
  const sections: RepaymentsSections = {
    cumulativeFunds: { metrics: [] },
    upcomingFunds: { metrics: [] },
    transactions: { metrics: [] },
    fundsRequest: { metrics: [] },
  }

  Object.keys(data).forEach((key) => {
    // Example of dynamic key: UpcomingLendingFundsFlow_1_Key
    const isDynamicLabelKey = key.endsWith('Key')

    if (isDynamicLabelKey) {
      handleDynamicMetric(key, data, sections)
    } else {
      handleStaticMetric(key, data, sections)
    }
  })

  sortCumulativeFundsMetrics(sections.cumulativeFunds.metrics)
  sortUpcomingFundsMetrics(sections.upcomingFunds.metrics)

  return sections
}

export default adaptDataForRepayments
