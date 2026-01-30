'use client'

import React, { useMemo } from 'react'

import VerticalBarChart from './VerticalBarChart'

import type { AggregatedGroup, BorrowerData } from '@/types/riskReporting'

type UnrealisedLossesChartProps = {
  borrowers: BorrowerData[]
  aggregated: AggregatedGroup
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

const UnrealisedLossesChart: React.FC<UnrealisedLossesChartProps> = ({
  borrowers,
  aggregated,
}) => {
  const chartData = useMemo(() => {
    const portfolioAvgLossRate =
      aggregated?.averages?.unrealisedLossRecoveryActionRate ?? 0

    return borrowers.slice(0, 11).map((borrower, idx) => {
      const recoveryAction = borrower.unrealisedLossRecoveryActionAmount ?? 0
      const lossRate = borrower.unrealisedLossRecoveryActionRate ?? 0

      return {
        label: String(idx + 1),
        values: [recoveryAction],
        lineValue: (lossRate ?? 0) * 100, // Convert to percentage
        lineValue2: (portfolioAvgLossRate ?? 0) * 100,
      }
    })
  }, [borrowers, aggregated])

  // Check if we have real data
  const hasData = chartData.some(
    (d) => d.values.some((v) => v > 0) || (d.lineValue && d.lineValue > 0)
  )

  // Calculate max values for axes
  const maxRecovery = useMemo(() => {
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
      const value = maxRecovery - (maxRecovery / (steps - 1)) * i
      return formatCurrency(value)
    })
  }, [maxRecovery])

  const rightAxisValues = [
    '4.0%',
    '3.5%',
    '3.0%',
    '2.5%',
    '2.0%',
    '1.5%',
    '1.0%',
    '0.5%',
    '0%',
  ]

  const legend = [
    { type: 'bar' as const, color: '#C4996C', label: 'Recovery Action ($)' },
    {
      type: 'line' as const,
      color: '#28282A',
      label: 'Unrealised Loss Rate (%)',
    },
    {
      type: 'line' as const,
      color: '#C4996C',
      label: 'Portfolio Average Unrealised Loss Rate(%)',
    },
  ]

  return (
    <VerticalBarChart
      title='Unrealised Losses'
      data={chartData}
      leftAxisValues={leftAxisValues}
      rightAxisValues={rightAxisValues}
      barColors={['#C4996C']}
      lineColor='#28282A'
      lineColor2='#C4996C'
      legend={legend}
      hasData={hasData}
      maxLeftValue={maxRecovery}
      maxRightValue={4}
    />
  )
}

export default UnrealisedLossesChart
