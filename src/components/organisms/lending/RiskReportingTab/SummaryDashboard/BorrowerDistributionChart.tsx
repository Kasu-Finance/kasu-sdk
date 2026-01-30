'use client'

import { Box, Typography } from '@mui/material'
import React from 'react'

import PieChart from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/PieChart'

import type { Aggregated } from '@/types/riskReporting'

type BorrowerDistributionChartProps = {
  aggregated: Aggregated
}

const BorrowerDistributionChart: React.FC<BorrowerDistributionChartProps> = ({
  aggregated,
}) => {
  const protectedCount =
    aggregated.protectedBorrowers?.totals?.aggregatedRecordCount || 0
  const unprotectedCount =
    aggregated.unprotectedBorrowers?.totals?.aggregatedRecordCount || 0
  const totalCount = protectedCount + unprotectedCount

  const chartData = [
    {
      id: 'protected',
      label: 'Protected Borrowers',
      value: protectedCount,
      color: 'rgba(232, 192, 145, 1)', // middle gold
    },
    {
      id: 'unprotected',
      label: 'Unprotected Borrowers',
      value: unprotectedCount,
      color: 'rgba(164, 123, 79, 1)', // extraDark gold
    },
  ].filter((item) => item.value > 0)

  // Show placeholder if no data
  if (chartData.length === 0 || totalCount === 0) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        height={220}
      >
        <Typography variant='baseSm' color='gray.main'>
          No borrower distribution data available
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant='baseMdBold' mb={2}>
        Borrowers Distribution - Protected Borrowers
      </Typography>
      <Box display='flex' alignItems='center' gap={3}>
        <Box position='relative' width={180} height={180}>
          <PieChart data={chartData} />
        </Box>
        <Box>
          {chartData.map((item) => (
            <Box key={item.id} display='flex' alignItems='center' mb={1}>
              <Box
                width={12}
                height={12}
                borderRadius='50%'
                bgcolor={item.color}
                mr={1}
              />
              <Typography variant='baseSm'>
                {item.label}: {item.value} (
                {((item.value / totalCount) * 100).toFixed(1)}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default BorrowerDistributionChart
