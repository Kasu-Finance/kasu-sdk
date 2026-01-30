'use client'

import { Box, Typography } from '@mui/material'
import React from 'react'

import type { AgingBuckets, LoansByAgingBucket } from '@/types/riskReporting'

type PortionOfArrearsChartProps = {
  agingBuckets: AgingBuckets
  loansByAgingBucket: LoansByAgingBucket
  totalFunding: number
}

// Colors from Figma
const CURRENT_FUNDING_COLOR = '#F9E0BB'
const ARREARS_COLOR = '#A47B4F'

// Y-axis labels
const Y_AXIS_LABELS = ['100%', '80%', '60%', '40%', '20%', '0%']

const PortionOfArrearsChart: React.FC<PortionOfArrearsChartProps> = ({
  agingBuckets,
  loansByAgingBucket,
}) => {
  const buckets = agingBuckets || {}
  const loansByBucket = loansByAgingBucket || {}
  const bucketKeys = Object.keys(buckets).sort((a, b) => Number(a) - Number(b))

  // Calculate current (0-30 days) vs arrears (31+ days)
  const currentAmount = loansByBucket['0'] || 0
  const arrearsAmount = bucketKeys
    .filter((key) => Number(key) > 0)
    .reduce((sum, key) => sum + (loansByBucket[key] || 0), 0)

  const totalValue = currentAmount + arrearsAmount

  // Calculate percentages
  const currentPercentage =
    totalValue > 0 ? (currentAmount / totalValue) * 100 : 0
  const arrearsPercentage =
    totalValue > 0 ? (arrearsAmount / totalValue) * 100 : 0

  if (totalValue === 0) {
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
            Portion of Arrears
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
          Portion of Arrears
        </Typography>
        <Box mt={0.5} height={1} bgcolor='#28282A' />
      </Box>

      {/* Chart area */}
      <Box display='flex' gap={2}>
        {/* Y-axis labels */}
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
          height={126}
          pr={1}
        >
          {Y_AXIS_LABELS.map((label) => (
            <Typography
              key={label}
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: 1.5,
                color: '#28282A',
                textAlign: 'right',
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        {/* Stacked bar chart */}
        <Box position='relative' flex={1} height={126}>
          {/* Grid lines (dashed) */}
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Box
              key={index}
              position='absolute'
              top={`${(index / 5) * 100}%`}
              left={0}
              right={0}
              height={0}
              borderTop='1px dashed #C6C6C6'
            />
          ))}

          {/* Stacked bar */}
          <Box
            position='absolute'
            left={16}
            right={16}
            top={0}
            bottom={0}
            display='flex'
            flexDirection='column'
          >
            {/* Arrears portion (top - darker) */}
            <Box
              sx={{
                height: `${arrearsPercentage}%`,
                bgcolor: ARREARS_COLOR,
                borderRadius: '2px 2px 0 0',
                minHeight: arrearsPercentage > 0 ? 6 : 0,
              }}
            />
            {/* Current funding portion (bottom - lighter) */}
            <Box
              sx={{
                flex: 1,
                bgcolor: CURRENT_FUNDING_COLOR,
                borderRadius: '0 0 2px 2px',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Legend */}
      <Box display='flex' gap={3} mt={2}>
        <Box display='flex' alignItems='center' gap={1}>
          <Box
            width={32}
            height={16}
            borderRadius={1}
            bgcolor={CURRENT_FUNDING_COLOR}
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
            Current Funding ({currentPercentage.toFixed(1)}%)
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={1}>
          <Box
            width={32}
            height={16}
            borderRadius={1}
            bgcolor={ARREARS_COLOR}
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
            Portion in Arrears ({arrearsPercentage.toFixed(1)}%)
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default PortionOfArrearsChart
