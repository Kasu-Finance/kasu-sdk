'use client'

import React, { useMemo } from 'react'

import VerticalBarChart from './VerticalBarChart'

import type { AggregatedGroup, BorrowerData } from '@/types/riskReporting'

type HistoricalLossRateChartProps = {
  borrowers: BorrowerData[]
  aggregated: AggregatedGroup
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

const HistoricalLossRateChart: React.FC<HistoricalLossRateChartProps> = ({
  borrowers,
  aggregated,
}) => {
  const chartData = useMemo(() => {
    const avgLossRate = aggregated?.averages?.totalRealisedLossesRate ?? 0

    return borrowers.slice(0, 11).map((borrower, idx) => {
      const realisedLosses = borrower.totalRealisedLossesAmount ?? 0
      const lossRate = borrower.totalRealisedLossesRate ?? 0

      return {
        label: String(idx + 1),
        values: [realisedLosses],
        lineValue: (lossRate ?? 0) * 100, // Convert to percentage
        lineValue2: (avgLossRate ?? 0) * 100,
      }
    })
  }, [borrowers, aggregated])

  // Check if we have real data
  const hasData = chartData.some(
    (d) => d.values.some((v) => v > 0) || (d.lineValue && d.lineValue > 0)
  )

  // Calculate max values for axes
  const maxLosses = useMemo(() => {
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
      const value = maxLosses - (maxLosses / (steps - 1)) * i
      return formatCurrency(value)
    })
  }, [maxLosses])

  const rightAxisValues = [
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
    {
      type: 'bar' as const,
      color: '#C4996C',
      label: 'Total Realised Losses ($)',
    },
    {
      type: 'line' as const,
      color: '#28282A',
      label: 'Historical Loss Rate (%)',
    },
    {
      type: 'line' as const,
      color: '#C4996C',
      label: 'Average Historical Loss Rate (%)',
    },
  ]

  return (
    <VerticalBarChart
      title='Historical Loss Rate (Realised Losses)'
      data={chartData}
      leftAxisValues={leftAxisValues}
      rightAxisValues={rightAxisValues}
      barColors={['#C4996C']}
      lineColor='#28282A'
      lineColor2='#C4996C'
      legend={legend}
      hasData={hasData}
      maxLeftValue={maxLosses}
      maxRightValue={3.5}
    />
  )
}

export default HistoricalLossRateChart
