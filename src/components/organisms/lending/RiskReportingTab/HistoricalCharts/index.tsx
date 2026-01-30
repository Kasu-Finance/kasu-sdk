'use client'

import { Box, Paper } from '@mui/material'
import React from 'react'

import CreditExposureChart from './CreditExposureChart'
import DebtServiceCoverChart from './DebtServiceCoverChart'
import DebtToIncomeChart from './DebtToIncomeChart'
import HistoricalLossRateChart from './HistoricalLossRateChart'
import RepaymentHistoryChart from './RepaymentHistoryChart'
import UnrealisedLossesChart from './UnrealisedLossesChart'

import type {
  AggregatedGroup,
  BorrowerData,
  FundingReportType,
} from '@/types/riskReporting'

type HistoricalChartsProps = {
  reportType: FundingReportType
  borrowers: BorrowerData[]
  aggregated: AggregatedGroup
}

const HistoricalCharts: React.FC<HistoricalChartsProps> = ({
  reportType,
  borrowers,
  aggregated,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
        p: 2,
        pb: 4,
      }}
    >
      {/* Row 1: 3 charts */}
      <Box display='flex' gap={4} flexWrap='wrap' mb={4}>
        <Box flex='1 1 300px' minWidth={300}>
          <CreditExposureChart
            reportType={reportType}
            borrowers={borrowers}
            aggregated={aggregated}
          />
        </Box>
        <Box flex='1 1 300px' minWidth={300}>
          <DebtToIncomeChart reportType={reportType} borrowers={borrowers} />
        </Box>
        <Box flex='1 1 300px' minWidth={300}>
          <DebtServiceCoverChart
            borrowers={borrowers}
            aggregated={aggregated}
          />
        </Box>
      </Box>

      {/* Row 2: 3 charts */}
      <Box display='flex' gap={4} flexWrap='wrap'>
        <Box flex='1 1 300px' minWidth={300}>
          <UnrealisedLossesChart
            borrowers={borrowers}
            aggregated={aggregated}
          />
        </Box>
        <Box flex='1 1 300px' minWidth={300}>
          <HistoricalLossRateChart
            borrowers={borrowers}
            aggregated={aggregated}
          />
        </Box>
        <Box flex='1 1 300px' minWidth={300}>
          <RepaymentHistoryChart
            reportType={reportType}
            borrowers={borrowers}
          />
        </Box>
      </Box>
    </Paper>
  )
}

export default HistoricalCharts
