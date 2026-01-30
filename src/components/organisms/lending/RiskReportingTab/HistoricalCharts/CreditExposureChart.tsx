'use client'

import React, { useMemo } from 'react'

import VerticalBarChart from './VerticalBarChart'

import type {
  AggregatedGroup,
  BorrowerData,
  FundingReportType,
} from '@/types/riskReporting'

type CreditExposureChartProps = {
  reportType: FundingReportType
  borrowers: BorrowerData[]
  aggregated: AggregatedGroup
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

const getTitle = (reportType: FundingReportType): string => {
  switch (reportType) {
    case 'taxPay':
      return 'Tax Pay Loans - Credit Exposure Metrics'
    case 'wholeLedger':
      return 'Ledger Loans - Credit Exposure Metrics'
    case 'professionalFee':
    default:
      return 'Invoice Loans - Credit Exposure Metrics'
  }
}

const CreditExposureChart: React.FC<CreditExposureChartProps> = ({
  reportType,
  borrowers,
  aggregated,
}) => {
  const chartData = useMemo(() => {
    // Get portfolio average advance rate
    const portfolioAvgRate =
      aggregated?.averages?.currentFundingAdvanceRate ?? 0

    return borrowers.slice(0, 11).map((borrower, idx) => {
      // For Tax Pay: Outstanding Taxes, Tax Pay Loan Outstanding, ATaxes Funded
      // For others: Current Invoice Funding, Total Ledger Funding
      const currentFunding =
        borrower.currentInvoiceFundingAmount ??
        borrower.currentFundedAmount ??
        0
      const totalLedgerFunding = borrower.totalLedgerFundingAmount ?? 0
      const advanceRate = borrower.currentFundingAdvanceRate ?? 0

      return {
        label: String(idx + 1),
        values: [
          currentFunding,
          totalLedgerFunding > currentFunding
            ? totalLedgerFunding - currentFunding
            : 0,
        ],
        lineValue: advanceRate * 100, // Convert to percentage
        lineValue2: portfolioAvgRate * 100,
      }
    })
  }, [borrowers, aggregated])

  // Calculate max values for axes
  const maxFunding = useMemo(() => {
    const maxVal = Math.max(...chartData.flatMap((d) => d.values), 1)
    // Round up to nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)))
    return Math.ceil(maxVal / magnitude) * magnitude
  }, [chartData])

  // Check if we have real data
  const hasData =
    borrowers.length > 0 && chartData.some((d) => d.values.some((v) => v > 0))

  // Generate Y-axis labels
  const leftAxisValues = useMemo(() => {
    const steps = 6
    return Array.from({ length: steps }, (_, i) => {
      const value = maxFunding - (maxFunding / (steps - 1)) * i
      return formatCurrency(value)
    })
  }, [maxFunding])

  const rightAxisValues = ['120%', '100%', '80%', '60%', '40%', '20%', '0%']

  const legend = [
    {
      type: 'bar' as const,
      color: '#E8C091',
      label: reportType === 'taxPay' ? 'Outstanding Taxes' : 'Current Funding',
    },
    {
      type: 'bar' as const,
      color: '#A47B4F',
      label:
        reportType === 'taxPay'
          ? 'Tax Pay Loan Outstanding'
          : 'Total Ledger Funding',
    },
    {
      type: 'line' as const,
      color: '#28282A',
      label: reportType === 'taxPay' ? 'ATaxes Funded' : 'Advance Rate',
    },
    {
      type: 'line' as const,
      color: '#C4996C',
      label: 'Portfolio Average Invoice Advance Rate %',
    },
  ]

  return (
    <VerticalBarChart
      title={getTitle(reportType)}
      data={chartData}
      leftAxisValues={leftAxisValues}
      rightAxisValues={rightAxisValues}
      barColors={['#E8C091', '#A47B4F']}
      lineColor='#28282A'
      lineColor2='#C4996C'
      legend={legend}
      hasData={hasData}
      maxLeftValue={maxFunding}
      maxRightValue={120}
    />
  )
}

export default CreditExposureChart
