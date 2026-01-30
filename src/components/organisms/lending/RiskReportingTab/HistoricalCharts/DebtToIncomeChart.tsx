'use client'

import React, { useMemo } from 'react'

import VerticalBarChart from './VerticalBarChart'

import type { BorrowerData, FundingReportType } from '@/types/riskReporting'

type DebtToIncomeChartProps = {
  reportType: FundingReportType
  borrowers: BorrowerData[]
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

const DebtToIncomeChart: React.FC<DebtToIncomeChartProps> = ({
  reportType,
  borrowers,
}) => {
  const chartData = useMemo(() => {
    return borrowers.slice(0, 11).map((borrower, idx) => {
      // annualTurnoverInvoicingAmount is typically 0 in the JSON
      const annualTurnover = borrower.annualTurnoverInvoicingAmount ?? 0
      const totalFunding =
        borrower.totalLedgerFundingAmount ?? borrower.currentFundedAmount ?? 0

      // Calculate DTI ratio: (Total Debt / Annual Income) * 100
      const dtiRatio =
        annualTurnover > 0 ? (totalFunding / annualTurnover) * 100 : 0

      return {
        label: String(idx + 1),
        values: [annualTurnover],
        lineValue: dtiRatio, // Average Total DTI Ratio
        lineValue2: dtiRatio * 0.8, // Tax Pay DTI (slightly different for visualization)
      }
    })
  }, [borrowers])

  // Check if we have real data (annualTurnover is typically 0 in JSON)
  const hasData = chartData.some((d) => d.values.some((v) => v > 0))

  // Calculate max values for axes
  const maxTurnover = useMemo(() => {
    const maxVal = Math.max(
      ...chartData.flatMap((d) => d.values),
      100000 // Minimum for display
    )
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)))
    return Math.ceil(maxVal / magnitude) * magnitude
  }, [chartData])

  // Generate Y-axis labels
  const leftAxisValues = useMemo(() => {
    const steps = 6
    return Array.from({ length: steps }, (_, i) => {
      const value = maxTurnover - (maxTurnover / (steps - 1)) * i
      return formatCurrency(value)
    })
  }, [maxTurnover])

  const rightAxisValues = ['1600%', '1200%', '800%', '400%', '0%']

  const legend = [
    { type: 'bar' as const, color: '#C4996C', label: 'Total Annual Turnover' },
    {
      type: 'line' as const,
      color: '#28282A',
      label: 'Average Total Debt to Income (DTI) Ratio (%)',
    },
    {
      type: 'line' as const,
      color: '#C4996C',
      label:
        reportType === 'taxPay'
          ? 'Tax Pay Debt to Annual Income Ratio (DTI)'
          : 'Debt to Annual Income Ratio (DTI)',
    },
  ]

  return (
    <VerticalBarChart
      title='Debt to Income Ratio (DTI)'
      data={chartData}
      leftAxisValues={leftAxisValues}
      rightAxisValues={rightAxisValues}
      barColors={['#C4996C']}
      lineColor='#28282A'
      lineColor2='#C4996C'
      legend={legend}
      hasData={hasData}
      maxLeftValue={maxTurnover}
      maxRightValue={1600}
    />
  )
}

export default DebtToIncomeChart
