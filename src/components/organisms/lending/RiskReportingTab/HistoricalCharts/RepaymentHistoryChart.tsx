'use client'

import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'

import type { BorrowerData, FundingReportType } from '@/types/riskReporting'

type RepaymentHistoryChartProps = {
  reportType: FundingReportType
  borrowers: BorrowerData[]
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

// Colors from Figma - matching the legend order
const COLORS = {
  funded: '#C4996C', // Gold - Loans Funded (Lifetime)
  repayments: '#E8C091', // Light Gold - Total Repayments (Lifetime)
  scheduled: '#A47B4F', // Dark Gold - Scheduled Repayments
  losses: '#6B6F76', // Grey - Total Realised Losses
}

const RepaymentHistoryChart: React.FC<RepaymentHistoryChartProps> = ({
  reportType,
  borrowers,
}) => {
  const chartData = useMemo(() => {
    return borrowers.slice(0, 11).map((borrower, idx) => {
      const funded = borrower.totalFundedLifetimeAmount ?? 0
      const repayments =
        borrower.totalRepaymentsLifetimeAmount ??
        borrower.totalRepaidLifetimeAmount ??
        0
      const scheduled = borrower.totalRepaymentsScheduledAmount ?? 0
      const losses = borrower.totalRealisedLossesAmount ?? 0

      return {
        index: idx + 1,
        funded,
        repayments,
        scheduled,
        losses,
      }
    })
  }, [borrowers])

  // Check if we have real data
  const hasData = chartData.some((d) => d.funded > 0 || d.repayments > 0)

  // Calculate max value for X-axis
  const maxValue = useMemo(() => {
    const maxVal = Math.max(
      ...chartData.flatMap((d) => [
        d.funded,
        d.repayments,
        d.scheduled,
        d.losses,
      ]),
      100000
    )
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)))
    return Math.ceil(maxVal / magnitude) * magnitude
  }, [chartData])

  // X-axis labels
  const xAxisLabels = useMemo(() => {
    return [
      '0',
      formatCurrency(maxValue * 0.33),
      formatCurrency(maxValue * 0.66),
      formatCurrency(maxValue),
    ]
  }, [maxValue])

  const getFundingLabel = () => {
    switch (reportType) {
      case 'taxPay':
        return 'Tax Pay Loans Funded (Lifetime) ($)'
      case 'wholeLedger':
        return 'Ledger Loans Funded (Lifetime) ($)'
      case 'professionalFee':
      default:
        return 'Invoice Loans Funded (Lifetime) ($)'
    }
  }

  const barHeight = 3 // Compact bar height
  const barGap = 1 // Minimal gap between bars
  const customerGap = 4 // Gap between customer groups

  return (
    <Box>
      {/* Header with title and line */}
      <Box pt={1} pb={0.5} mb={2}>
        <Box display='flex' alignItems='center' gap={1}>
          <Typography
            sx={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 500,
              fontSize: 20,
              lineHeight: 1,
              letterSpacing: '0.02em',
              color: '#28282A',
            }}
          >
            Repayment History & Performance
          </Typography>
          {!hasData && (
            <Typography
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 600,
                fontSize: 10,
                color: '#FF9921',
                bgcolor: 'rgba(255, 153, 33, 0.2)',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
              }}
            >
              N/A
            </Typography>
          )}
        </Box>
        <Box mt={0.5} height={1} bgcolor='#28282A' />
      </Box>

      {/* Chart area */}
      <Box>
        {/* Customer rows - each with 4 separate bars */}
        {chartData.map((item, idx) => (
          <Box
            key={idx}
            display='flex'
            alignItems='flex-start'
            gap={1}
            mb={`${customerGap}px`}
          >
            {/* Customer label */}
            <Typography
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 400,
                fontSize: 10,
                color: '#28282A',
                minWidth: 70,
                textAlign: 'right',
                pt: 0.125,
              }}
            >
              Customer {item.index}
            </Typography>

            {/* 4 separate bars stacked vertically */}
            <Box
              flex={1}
              display='flex'
              flexDirection='column'
              gap={`${barGap}px`}
            >
              {/* Bar 1: Loans Funded */}
              <Box
                sx={{
                  height: barHeight,
                  width: `${(item.funded / maxValue) * 100}%`,
                  minWidth: item.funded > 0 ? 2 : 0,
                  bgcolor: COLORS.funded,
                  borderRadius: 0.5,
                }}
              />
              {/* Bar 2: Total Repayments */}
              <Box
                sx={{
                  height: barHeight,
                  width: `${(item.repayments / maxValue) * 100}%`,
                  minWidth: item.repayments > 0 ? 2 : 0,
                  bgcolor: COLORS.repayments,
                  borderRadius: 0.5,
                }}
              />
              {/* Bar 3: Scheduled Repayments */}
              <Box
                sx={{
                  height: barHeight,
                  width: `${(item.scheduled / maxValue) * 100}%`,
                  minWidth: item.scheduled > 0 ? 2 : 0,
                  bgcolor: COLORS.scheduled,
                  borderRadius: 0.5,
                }}
              />
              {/* Bar 4: Total Realised Losses */}
              <Box
                sx={{
                  height: barHeight,
                  width: `${(item.losses / maxValue) * 100}%`,
                  minWidth: item.losses > 0 ? 2 : 0,
                  bgcolor: COLORS.losses,
                  borderRadius: 0.5,
                }}
              />
            </Box>
          </Box>
        ))}

        {/* X-axis labels */}
        <Box display='flex' pl={11} mt={1}>
          <Box display='flex' justifyContent='space-between' flex={1}>
            {xAxisLabels.map((label, idx) => (
              <Typography
                key={idx}
                sx={{
                  fontFamily: '"Open Sans", sans-serif',
                  fontWeight: 400,
                  fontSize: 10,
                  color: '#28282A',
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Legend */}
      <Box display='flex' gap={2} mt={2} flexWrap='wrap'>
        <Box display='flex' alignItems='center' gap={0.5}>
          <Box
            width={16}
            height={10}
            borderRadius={0.5}
            bgcolor={COLORS.funded}
          />
          <Typography
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontWeight: 400,
              fontSize: 10,
              color: '#28282A',
            }}
          >
            {getFundingLabel()}
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={0.5}>
          <Box
            width={16}
            height={10}
            borderRadius={0.5}
            bgcolor={COLORS.repayments}
          />
          <Typography
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontWeight: 400,
              fontSize: 10,
              color: '#28282A',
            }}
          >
            Total Repayments (Lifetime) ($)
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={0.5}>
          <Box
            width={16}
            height={10}
            borderRadius={0.5}
            bgcolor={COLORS.scheduled}
          />
          <Typography
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontWeight: 400,
              fontSize: 10,
              color: '#28282A',
            }}
          >
            Scheduled Repayments ($)
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={0.5}>
          <Box
            width={16}
            height={10}
            borderRadius={0.5}
            bgcolor={COLORS.losses}
          />
          <Typography
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontWeight: 400,
              fontSize: 10,
              color: '#28282A',
            }}
          >
            Total Realised Losses ($)
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default RepaymentHistoryChart
