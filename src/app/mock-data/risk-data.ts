import { BadDebtTableData } from '@/components/molecules/risk/badDebtsTable'
import { PoolCreditData } from '@/components/molecules/risk/PoolCreditTable'

export const mockBadDebtData: BadDebtTableData[] = [
  {
    category: 'Arrears',
    empty: '',
    totalAmount: 11,
    totalAmountSuffix: 'totalAmountSuffix',
    monthlyAverage: 200,
    monthlyAverageSuffix: '',
    currentStatus: 'Low',
    currentStatusSuffix: '',
  },
  {
    category: 'Defaults',
    empty: '',
    totalAmount: 0,
    totalAmountSuffix: 'totalAmountSuffix',
    monthlyAverage: 200,
    monthlyAverageSuffix: '',
    currentStatus: 'Low',
    currentStatusSuffix: '',
  },
  {
    category: 'Recovery Action - Unrealised Losses',
    empty: '',
    totalAmount: 11,
    totalAmountSuffix: 'totalAmountSuffix',
    monthlyAverage: 0,
    monthlyAverageSuffix: '',
    currentStatus: 'Low',
    currentStatusSuffix: '',
  },
  {
    category: 'Realised Losses',
    empty: '',
    totalAmount: 11,
    totalAmountSuffix: '',
    monthlyAverage: 200,
    monthlyAverageSuffix: '',
    currentStatus: '',
    currentStatusSuffix: '',
  },
]

export const poolCreditMock: PoolCreditData[] = [
  {
    keyMetric: 'Net Income',
    previousFiscalYear: 0.5,
    mostRecentQuarter: 25000,
    priorMonth: 5000,
  },
  {
    keyMetric: 'Net Income 2',
    previousFiscalYear: 2.5,
    mostRecentQuarter: 2,
    priorMonth: 12,
  },
  {
    keyMetric: 'Net Income 3',
    previousFiscalYear: 1.5,
    mostRecentQuarter: 132,
    priorMonth: 4353,
  },
]
