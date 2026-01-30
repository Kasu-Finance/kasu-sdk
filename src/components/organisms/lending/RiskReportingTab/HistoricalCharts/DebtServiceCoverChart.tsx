'use client'

import React, { useMemo } from 'react'

import VerticalBarChart from './VerticalBarChart'

import type { AggregatedGroup, BorrowerData } from '@/types/riskReporting'

type DebtServiceCoverChartProps = {
  borrowers: BorrowerData[]
  aggregated: AggregatedGroup
}

const DebtServiceCoverChart: React.FC<DebtServiceCoverChartProps> = ({
  borrowers,
  aggregated,
}) => {
  const chartData = useMemo(() => {
    const portfolioAvgLossRate =
      aggregated?.averages?.unrealisedLossRecoveryActionRate ?? 0

    return borrowers.slice(0, 11).map((borrower, idx) => {
      // debtServiceCoverRatio and minimumCovenant are often null in JSON
      const dscr = borrower.debtServiceCoverRatio ?? 0
      const minCovenant = borrower.minimumCovenant ?? 1.0

      return {
        label: String(idx + 1),
        values: [dscr],
        lineValue: minCovenant,
        lineValue2: portfolioAvgLossRate * 100,
      }
    })
  }, [borrowers, aggregated])

  // Check if we have real data (DSCR is typically null in JSON)
  const hasData = chartData.some((d) => d.values.some((v) => v > 0))

  const leftAxisValues = [
    '3.0 ×',
    '2.5 ×',
    '2.0 ×',
    '1.5 ×',
    '1.0 ×',
    '0.5 ×',
    '0 ×',
  ]
  const rightAxisValues = ['2.5%', '2.0%', '1.5%', '1.0%', '0.5%', '0%']

  const legend = [
    {
      type: 'bar' as const,
      color: '#C4996C',
      label: 'Debt Service Cover Ratio (DSCR)',
    },
    { type: 'line' as const, color: '#28282A', label: 'Minimum Covenant' },
    {
      type: 'line' as const,
      color: '#C4996C',
      label: 'Portfolio Average Unrealised Loss Rate(%)',
    },
  ]

  return (
    <VerticalBarChart
      title='Covenant Reporting - Debt Service Cover Ratio'
      data={chartData}
      leftAxisValues={leftAxisValues}
      rightAxisValues={rightAxisValues}
      barColors={['#C4996C']}
      lineColor='#28282A'
      lineColor2='#C4996C'
      legend={legend}
      hasData={hasData}
      maxLeftValue={3}
      maxRightValue={2.5}
    />
  )
}

export default DebtServiceCoverChart
