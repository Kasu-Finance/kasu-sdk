import { Box, Grid, Paper } from '@mui/material'
import React from 'react'

import ArrearsScheduleChart from '@/components/organisms/lending/RiskReportingTab/ArrearsCharts/ArrearsScheduleChart'
import PortionOfArrearsChart from '@/components/organisms/lending/RiskReportingTab/ArrearsCharts/PortionOfArrearsChart'

import type {
  AgingBuckets,
  FundingReportType,
  LoansByAgingBucket,
} from '@/types/riskReporting'

type ArrearsChartsProps = {
  agingBuckets: AgingBuckets
  loansByAgingBucket: LoansByAgingBucket
  totalFunding: number
  reportType: FundingReportType
}

/**
 * Get arrears schedule chart title based on funding type
 */
const getArrearsScheduleTitle = (reportType: FundingReportType): string => {
  switch (reportType) {
    case 'taxPay':
      return 'Tax Pay Loans - Arrears Schedule'
    case 'wholeLedger':
      return 'Whole Ledger - Arrears Schedule'
    case 'professionalFee':
    default:
      return 'Professional Fee - Arrears Schedule'
  }
}

const ArrearsCharts: React.FC<ArrearsChartsProps> = ({
  agingBuckets,
  loansByAgingBucket,
  totalFunding,
  reportType,
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
      <Grid container spacing={4} justifyContent='space-between'>
        <Grid item xs={12} md={6}>
          <Box>
            <ArrearsScheduleChart
              agingBuckets={agingBuckets}
              loansByAgingBucket={loansByAgingBucket}
              title={getArrearsScheduleTitle(reportType)}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box>
            <PortionOfArrearsChart
              agingBuckets={agingBuckets}
              loansByAgingBucket={loansByAgingBucket}
              totalFunding={totalFunding}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default ArrearsCharts
