/**
 * Risk Reporting Types
 * Based on the JSON structure from risk report data
 */

// Day-based aging bucket (wholeLedger, taxPay)
export interface DayBasedAgingBucket {
  startDay: number
  endDay: number
  description: string
}

// Month-based aging bucket (professionalFee)
export interface MonthBasedAgingBucket {
  month: number
  description: string
}

// Union type for aging buckets
export type AgingBucket = DayBasedAgingBucket | MonthBasedAgingBucket

export type AgingBuckets = Record<string, AgingBucket>

export type LoansByAgingBucket = Record<string, number>

export interface SummaryData {
  totalWipAndOutstandingInvoicesAmount: number
  totalCurrentLedgerFundingAmount: number
  totalAdvanceRate: number
  currentLoanArrearsAmount: number
  currentLoanArrearsRate: number
  historicalLossRate: number
}

export interface BorrowerData {
  borrowerId: string
  isProtectedBorrower: boolean
  isAggregatedRecord: boolean
  aggregatedRecordCount: number
  subjectToChargebackAmount?: number
  currentOutstandingInvoicesAmount?: number
  currentInvoiceFundingAmount?: number
  currentFundingAdvanceRate?: number
  averageLoanDurationMonths?: number
  annualTurnoverInvoicingAmount?: number
  currentWipLedgerValueAmount?: number
  currentWipLedgerFundingAmount?: number
  currentWipFundingAdvanceRate?: number
  totalLedgerValueAmount?: number
  totalLedgerFundingAmount?: number
  totalFundingRelativeToAnnualInvoicesRate?: number
  totalFundedLifetimeAmount?: number
  totalRepaymentsLifetimeAmount?: number
  totalRepaymentsScheduledAmount?: number
  unrealisedLossRecoveryActionAmount?: number
  unrealisedLossRecoveryActionRate?: number | null
  totalRealisedLossesAmount?: number
  totalRealisedLossesRate?: number | null
  totalNonRecoverableLossesAmount?: number
  loansByAgingBucket?: LoansByAgingBucket
  loansByScheduleBucketAmount?: Record<string, number>
  // Tax Pay specific fields
  currentFundedAmount?: number
  totalRepaidLifetimeAmount?: number
  totalChargebacksLifetimeAmount?: number
  // Covenant fields (often null)
  debtServiceCoverRatio?: number | null
  minimumCovenant?: number | null
}

export interface AggregatedBorrowerData {
  isProtectedBorrower: boolean
  isAggregatedRecord: boolean
  aggregatedRecordCount: number
  subjectToChargebackAmount: number
  currentOutstandingInvoicesAmount: number
  currentInvoiceFundingAmount: number
  currentFundingAdvanceRate: number
  averageLoanDurationMonths: number
  annualTurnoverInvoicingAmount: number
  currentWipLedgerValueAmount: number
  currentWipLedgerFundingAmount: number
  currentWipFundingAdvanceRate: number
  totalLedgerValueAmount: number
  totalLedgerFundingAmount: number
  totalFundingRelativeToAnnualInvoicesRate: number
  totalFundedLifetimeAmount: number
  totalRepaymentsLifetimeAmount: number
  totalRepaymentsScheduledAmount: number
  unrealisedLossRecoveryActionAmount: number
  unrealisedLossRecoveryActionRate: number
  totalRealisedLossesAmount: number
  totalRealisedLossesRate: number
  totalNonRecoverableLossesAmount: number
  loansByAgingBucket: LoansByAgingBucket
}

export interface AggregatedGroup {
  totals: AggregatedBorrowerData
  averages: AggregatedBorrowerData
}

export interface Aggregated {
  allBorrowers: AggregatedGroup
  protectedBorrowers: AggregatedGroup
  unprotectedBorrowers: AggregatedGroup
}

export type FundingReportType = 'wholeLedger' | 'professionalFee' | 'taxPay'

export interface FundingReport {
  reportType: FundingReportType
  agingBuckets: AgingBuckets
  summaryData: SummaryData
  borrowers: BorrowerData[]
  aggregated: Aggregated
}

export interface RiskReport {
  generatedAt: string
  wholeLedgerFunding?: FundingReport
  professionalFeeFunding?: FundingReport
  taxPayFunding?: FundingReport
}

export type FundingTypeKey =
  | 'wholeLedgerFunding'
  | 'professionalFeeFunding'
  | 'taxPayFunding'
