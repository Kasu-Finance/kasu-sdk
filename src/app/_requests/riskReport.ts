import { unstable_cache } from 'next/cache'

import { getPoolOverview } from '@/app/_requests/pools'

import type {
  AggregatedBorrowerData,
  AggregatedGroup,
  BorrowerData,
  FundingReport,
  FundingTypeKey,
  LoansByAgingBucket,
  RiskReport,
  SummaryData,
} from '@/types/riskReporting'

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
const riskReportData: any = require('../../../KasuReport2025-11-13T131952Z 2.json')

const CACHE_TTL = 60 * 60 // 1 hour

/**
 * Map pool name/assetClass to funding type key in the JSON
 */
const POOL_NAME_TO_FUNDING_TYPE: Record<string, FundingTypeKey> = {
  'whole ledger funding': 'wholeLedgerFunding',
  'whole ledger': 'wholeLedgerFunding',
  'professional fee funding': 'professionalFeeFunding',
  'professional fee': 'professionalFeeFunding',
  'taxation funding': 'taxPayFunding',
  'taxation funding (tax pay)': 'taxPayFunding',
  'tax pay': 'taxPayFunding',
  taxpay: 'taxPayFunding',
}

/**
 * Get the funding type key from pool name or asset class
 */
export const getFundingTypeFromPoolName = (
  poolName?: string,
  assetClass?: string
): FundingTypeKey | null => {
  const searchTerms = [poolName, assetClass].filter(Boolean)

  for (const term of searchTerms) {
    const normalizedTerm = term?.toLowerCase().trim()
    if (normalizedTerm && POOL_NAME_TO_FUNDING_TYPE[normalizedTerm]) {
      return POOL_NAME_TO_FUNDING_TYPE[normalizedTerm]
    }

    // Partial match
    for (const [key, value] of Object.entries(POOL_NAME_TO_FUNDING_TYPE)) {
      if (normalizedTerm?.includes(key) || key.includes(normalizedTerm || '')) {
        return value
      }
    }
  }

  return null
}

/**
 * Normalize summary data from different funding type formats
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeSummaryData = (
  rawSummary: any,
  fundingType: FundingTypeKey
): SummaryData => {
  // Map different field names to common structure
  const fieldMappings: Record<
    FundingTypeKey,
    { invoices: string; funding: string }
  > = {
    wholeLedgerFunding: {
      invoices: 'totalWipAndOutstandingInvoicesAmount',
      funding: 'totalCurrentLedgerFundingAmount',
    },
    professionalFeeFunding: {
      invoices: 'totalOutstandingInvoicesAmount',
      funding: 'totalCurrentInvoiceFundingAmount',
    },
    taxPayFunding: {
      invoices: 'totalTaxPaidAmount',
      funding: 'totalTaxFundingAmount',
    },
  }

  const mapping = fieldMappings[fundingType]

  return {
    totalWipAndOutstandingInvoicesAmount: rawSummary[mapping.invoices] ?? 0,
    totalCurrentLedgerFundingAmount: rawSummary[mapping.funding] ?? 0,
    totalAdvanceRate: rawSummary.totalAdvanceRate ?? 0,
    currentLoanArrearsAmount: rawSummary.currentLoanArrearsAmount ?? 0,
    currentLoanArrearsRate: rawSummary.currentLoanArrearsRate ?? 0,
    historicalLossRate: rawSummary.historicalLossRate ?? 0,
  }
}

/**
 * Get loans by bucket from borrower data (handles different field names)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLoansByBucket = (rawBorrower: any): LoansByAgingBucket => {
  // Try different field names
  return (
    rawBorrower.loansByAgingBucket ||
    rawBorrower.loansByScheduleBucketAmount ||
    {}
  )
}

/**
 * Normalize borrower data from different funding type formats
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeBorrower = (rawBorrower: any): BorrowerData => {
  return {
    borrowerId: rawBorrower.borrowerId || '',
    isProtectedBorrower: rawBorrower.isProtectedBorrower ?? false,
    isAggregatedRecord: rawBorrower.isAggregatedRecord ?? false,
    aggregatedRecordCount: rawBorrower.aggregatedRecordCount ?? 1,
    subjectToChargebackAmount: rawBorrower.subjectToChargebackAmount ?? 0,
    currentOutstandingInvoicesAmount:
      rawBorrower.currentOutstandingInvoicesAmount ?? 0,
    // Handle different field names for current funding
    currentInvoiceFundingAmount:
      rawBorrower.currentInvoiceFundingAmount ??
      rawBorrower.currentFundedAmount ??
      0,
    currentFundingAdvanceRate: rawBorrower.currentFundingAdvanceRate ?? 0,
    averageLoanDurationMonths: rawBorrower.averageLoanDurationMonths ?? 0,
    annualTurnoverInvoicingAmount:
      rawBorrower.annualTurnoverInvoicingAmount ?? 0,
    currentWipLedgerValueAmount: rawBorrower.currentWipLedgerValueAmount ?? 0,
    currentWipLedgerFundingAmount:
      rawBorrower.currentWipLedgerFundingAmount ?? 0,
    currentWipFundingAdvanceRate: rawBorrower.currentWipFundingAdvanceRate ?? 0,
    totalLedgerValueAmount: rawBorrower.totalLedgerValueAmount ?? 0,
    totalLedgerFundingAmount: rawBorrower.totalLedgerFundingAmount ?? 0,
    totalFundingRelativeToAnnualInvoicesRate:
      rawBorrower.totalFundingRelativeToAnnualInvoicesRate ?? 0,
    totalFundedLifetimeAmount: rawBorrower.totalFundedLifetimeAmount ?? 0,
    totalRepaymentsLifetimeAmount:
      rawBorrower.totalRepaymentsLifetimeAmount ??
      rawBorrower.totalRepaidLifetimeAmount ??
      0,
    totalRepaymentsScheduledAmount:
      rawBorrower.totalRepaymentsScheduledAmount ?? 0,
    unrealisedLossRecoveryActionAmount:
      rawBorrower.unrealisedLossRecoveryActionAmount ?? 0,
    unrealisedLossRecoveryActionRate:
      rawBorrower.unrealisedLossRecoveryActionRate ?? 0,
    totalRealisedLossesAmount: rawBorrower.totalRealisedLossesAmount ?? 0,
    totalRealisedLossesRate: rawBorrower.totalRealisedLossesRate ?? 0,
    totalNonRecoverableLossesAmount:
      rawBorrower.totalNonRecoverableLossesAmount ?? 0,
    loansByAgingBucket: getLoansByBucket(rawBorrower),
  }
}

/**
 * Normalize aggregated borrower data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeAggregatedBorrower = (rawData: any): AggregatedBorrowerData => {
  if (!rawData) {
    return {
      isProtectedBorrower: false,
      isAggregatedRecord: true,
      aggregatedRecordCount: 0,
      subjectToChargebackAmount: 0,
      currentOutstandingInvoicesAmount: 0,
      currentInvoiceFundingAmount: 0,
      currentFundingAdvanceRate: 0,
      averageLoanDurationMonths: 0,
      annualTurnoverInvoicingAmount: 0,
      currentWipLedgerValueAmount: 0,
      currentWipLedgerFundingAmount: 0,
      currentWipFundingAdvanceRate: 0,
      totalLedgerValueAmount: 0,
      totalLedgerFundingAmount: 0,
      totalFundingRelativeToAnnualInvoicesRate: 0,
      totalFundedLifetimeAmount: 0,
      totalRepaymentsLifetimeAmount: 0,
      totalRepaymentsScheduledAmount: 0,
      unrealisedLossRecoveryActionAmount: 0,
      unrealisedLossRecoveryActionRate: 0,
      totalRealisedLossesAmount: 0,
      totalRealisedLossesRate: 0,
      totalNonRecoverableLossesAmount: 0,
      loansByAgingBucket: {},
    }
  }

  return {
    isProtectedBorrower: rawData.isProtectedBorrower ?? false,
    isAggregatedRecord: rawData.isAggregatedRecord ?? true,
    aggregatedRecordCount: rawData.aggregatedRecordCount ?? 0,
    subjectToChargebackAmount: rawData.subjectToChargebackAmount ?? 0,
    currentOutstandingInvoicesAmount:
      rawData.currentOutstandingInvoicesAmount ?? 0,
    currentInvoiceFundingAmount:
      rawData.currentInvoiceFundingAmount ?? rawData.currentFundedAmount ?? 0,
    currentFundingAdvanceRate: rawData.currentFundingAdvanceRate ?? 0,
    averageLoanDurationMonths: rawData.averageLoanDurationMonths ?? 0,
    annualTurnoverInvoicingAmount: rawData.annualTurnoverInvoicingAmount ?? 0,
    currentWipLedgerValueAmount: rawData.currentWipLedgerValueAmount ?? 0,
    currentWipLedgerFundingAmount: rawData.currentWipLedgerFundingAmount ?? 0,
    currentWipFundingAdvanceRate: rawData.currentWipFundingAdvanceRate ?? 0,
    totalLedgerValueAmount: rawData.totalLedgerValueAmount ?? 0,
    totalLedgerFundingAmount: rawData.totalLedgerFundingAmount ?? 0,
    totalFundingRelativeToAnnualInvoicesRate:
      rawData.totalFundingRelativeToAnnualInvoicesRate ?? 0,
    totalFundedLifetimeAmount: rawData.totalFundedLifetimeAmount ?? 0,
    totalRepaymentsLifetimeAmount:
      rawData.totalRepaymentsLifetimeAmount ??
      rawData.totalRepaidLifetimeAmount ??
      0,
    totalRepaymentsScheduledAmount: rawData.totalRepaymentsScheduledAmount ?? 0,
    unrealisedLossRecoveryActionAmount:
      rawData.unrealisedLossRecoveryActionAmount ?? 0,
    unrealisedLossRecoveryActionRate:
      rawData.unrealisedLossRecoveryActionRate ?? 0,
    totalRealisedLossesAmount: rawData.totalRealisedLossesAmount ?? 0,
    totalRealisedLossesRate: rawData.totalRealisedLossesRate ?? 0,
    totalNonRecoverableLossesAmount:
      rawData.totalNonRecoverableLossesAmount ?? 0,
    loansByAgingBucket: getLoansByBucket(rawData),
  }
}

/**
 * Normalize aggregated group
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeAggregatedGroup = (rawGroup: any): AggregatedGroup => {
  return {
    totals: normalizeAggregatedBorrower(rawGroup?.totals),
    averages: normalizeAggregatedBorrower(rawGroup?.averages),
  }
}

/**
 * Normalize the entire funding report
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeFundingReport = (
  rawReport: any,
  fundingType: FundingTypeKey
): FundingReport => {
  return {
    reportType: rawReport.reportType || fundingType.replace('Funding', ''),
    agingBuckets: rawReport.agingBuckets || {},
    summaryData: normalizeSummaryData(rawReport.summaryData || {}, fundingType),
    borrowers: (rawReport.borrowers || []).map(normalizeBorrower),
    aggregated: {
      allBorrowers: normalizeAggregatedGroup(
        rawReport.aggregated?.allBorrowers
      ),
      protectedBorrowers: normalizeAggregatedGroup(
        rawReport.aggregated?.protectedBorrowers
      ),
      unprotectedBorrowers: normalizeAggregatedGroup(
        rawReport.aggregated?.unprotectedBorrowers
      ),
    },
  }
}

/**
 * Get risk report data for a specific pool
 */
export const getRiskReport = unstable_cache(
  async (poolId?: string): Promise<FundingReport | null> => {
    if (!poolId) return null

    const pools = await getPoolOverview()
    const pool = pools.find((p) => p.id.toLowerCase() === poolId.toLowerCase())

    if (!pool) return null

    const fundingTypeKey = getFundingTypeFromPoolName(
      pool.poolName,
      pool.assetClass
    )

    if (!fundingTypeKey) return null

    const report = riskReportData as RiskReport
    const rawFundingReport = report[fundingTypeKey]

    if (!rawFundingReport) return null

    return normalizeFundingReport(rawFundingReport, fundingTypeKey)
  },
  ['riskReport'],
  {
    tags: ['riskReport'],
    revalidate: CACHE_TTL,
  }
)

/**
 * Get full risk report data (all funding types)
 */
export const getFullRiskReport = unstable_cache(
  async (): Promise<RiskReport> => {
    return riskReportData as RiskReport
  },
  ['fullRiskReport'],
  {
    tags: ['fullRiskReport'],
    revalidate: CACHE_TTL,
  }
)
