'use client'

import { Box, Grid, Typography } from '@mui/material'
import React from 'react'

import PieChart from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/PieChart'

import type { AgingBuckets, LoansByAgingBucket } from '@/types/riskReporting'

type ArrearsScheduleChartProps = {
  agingBuckets: AgingBuckets
  loansByAgingBucket: LoansByAgingBucket
  title?: string
}

// 12-color gradient from Figma (lightest to darkest)
const CHART_COLORS = [
  '#F7F1E5', // Extra Light
  '#EEE0CA',
  '#EFDDC1',
  '#F0D7B1',
  '#F2D19F',
  '#E4C18F',
  '#D7B180',
  '#D2A770',
  '#BC9160',
  '#B18554',
  '#A47643', // Darkest
]

const ArrearsScheduleChart: React.FC<ArrearsScheduleChartProps> = ({
  agingBuckets,
  loansByAgingBucket,
  title = 'Tax Pay Loans - Arrears Schedule',
}) => {
  const buckets = agingBuckets || {}
  const loansByBucket = loansByAgingBucket || {}
  const bucketKeys = Object.keys(buckets).sort((a, b) => Number(a) - Number(b))

  const chartData = bucketKeys.map((key, index) => ({
    id: key,
    label: buckets[key]?.description || `Bucket ${key}`,
    value: loansByBucket[key] || 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

  if (chartData.length === 0 || totalValue === 0) {
    return (
      <Box>
        {/* Header with title and line */}
        <Box pt={1} pb={0.5} mb={2}>
          <Typography
            sx={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 500,
              fontSize: 24,
              lineHeight: 1,
              letterSpacing: '0.01em',
              color: '#28282A',
            }}
          >
            {title}
          </Typography>
          <Box mt={0.5} height={1} bgcolor='#28282A' />
        </Box>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          height={180}
        >
          <Typography variant='baseSm' color='gray.main'>
            No arrears data available
          </Typography>
        </Box>
      </Box>
    )
  }

  // Split legend into two columns
  const halfLength = Math.ceil(chartData.length / 2)
  const leftColumn = chartData.slice(0, halfLength)
  const rightColumn = chartData.slice(halfLength)

  return (
    <Box>
      {/* Header with title and line */}
      <Box pt={1} pb={0.5} mb={2}>
        <Typography
          sx={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 500,
            fontSize: 24,
            lineHeight: 1,
            letterSpacing: '0.01em',
            color: '#28282A',
          }}
        >
          {title}
        </Typography>
        <Box mt={0.5} height={1} bgcolor='#28282A' />
      </Box>

      {/* Legend and Chart side by side */}
      <Box display='flex' alignItems='center' gap={2}>
        {/* Legend - Two columns */}
        <Grid container spacing={2} sx={{ width: 296 }}>
          <Grid item xs={6}>
            {leftColumn.map((item) => (
              <Box key={item.id} display='flex' alignItems='center' height={24}>
                <Box
                  width={32}
                  height={16}
                  borderRadius={1}
                  bgcolor={item.color}
                  mr={1}
                  flexShrink={0}
                />
                <Typography
                  sx={{
                    fontFamily: '"Open Sans", sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: '#28282A',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Grid>
          <Grid item xs={6}>
            {rightColumn.map((item) => (
              <Box key={item.id} display='flex' alignItems='center' height={24}>
                <Box
                  width={32}
                  height={16}
                  borderRadius={1}
                  bgcolor={item.color}
                  mr={1}
                  flexShrink={0}
                />
                <Typography
                  sx={{
                    fontFamily: '"Open Sans", sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: '#28282A',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>

        {/* Pie Chart */}
        <Box position='relative' width={210} height={210} flexShrink={0}>
          <PieChart data={chartData} />
        </Box>
      </Box>
    </Box>
  )
}

export default ArrearsScheduleChart
