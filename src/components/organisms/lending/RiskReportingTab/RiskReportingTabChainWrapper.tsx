'use client'

import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { useChain } from '@/hooks/context/useChain'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import WaveBox from '@/components/atoms/WaveBox'
import ArrearsCharts from '@/components/organisms/lending/RiskReportingTab/ArrearsCharts'
import BorrowerSchedule from '@/components/organisms/lending/RiskReportingTab/BorrowerSchedule'
import CreditRiskMetricsTable from '@/components/organisms/lending/RiskReportingTab/CreditRiskMetricsTable'
import DTIConcentrationTable from '@/components/organisms/lending/RiskReportingTab/DTIConcentrationTable'
import HistoricalCharts from '@/components/organisms/lending/RiskReportingTab/HistoricalCharts'
import RiskReportingTabSkeleton from '@/components/organisms/lending/RiskReportingTab/RiskReportingTabSkeleton'
import SummaryDashboard from '@/components/organisms/lending/RiskReportingTab/SummaryDashboard'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

import { FundingReport } from '@/types/riskReporting'

type RiskReportingTabChainWrapperProps = {
  /** Server-rendered risk report (from default chain, null if not found) */
  serverRiskReport: FundingReport | null
}

/**
 * Chain-aware wrapper for RiskReportingTab content.
 *
 * On DEFAULT_CHAIN (Base): Uses server-rendered data.
 * On other chains (XDC): Shows coming soon message (risk reports not available yet).
 */
const RiskReportingTabChainWrapper: React.FC<
  RiskReportingTabChainWrapperProps
> = ({ serverRiskReport }) => {
  const { currentChainId, chainConfig } = useChain()
  const isDefaultChain = currentChainId === DEFAULT_CHAIN_ID
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Render the risk reporting content
  const renderContent = (riskReport: FundingReport | null) => {
    if (!riskReport) return <RiskReportingTabSkeleton />

    return (
      <Stack spacing={3} mt={3}>
        {/* Risk Summary Dashboard */}
        {riskReport.summaryData && (
          <SummaryDashboard
            summaryData={riskReport.summaryData}
            reportType={riskReport.reportType}
          />
        )}

        {/* Borrower/Duration Schedule Table */}
        {riskReport.borrowers &&
          riskReport.borrowers.length > 0 &&
          riskReport.agingBuckets &&
          riskReport.aggregated?.allBorrowers?.totals && (
            <BorrowerSchedule
              agingBuckets={riskReport.agingBuckets}
              borrowers={riskReport.borrowers}
              totals={riskReport.aggregated.allBorrowers.totals}
              reportType={riskReport.reportType}
            />
          )}

        {/* Arrears Analysis Charts */}
        {riskReport.agingBuckets &&
          riskReport.aggregated?.allBorrowers?.totals?.loansByAgingBucket && (
            <ArrearsCharts
              agingBuckets={riskReport.agingBuckets}
              loansByAgingBucket={
                riskReport.aggregated.allBorrowers.totals.loansByAgingBucket
              }
              totalFunding={
                riskReport.summaryData?.totalCurrentLedgerFundingAmount || 0
              }
              reportType={riskReport.reportType}
            />
          )}

        {/* DTI Concentration Risk Table */}
        <DTIConcentrationTable reportType={riskReport.reportType} />

        {/* Credit Risk Metrics Table */}
        {riskReport.borrowers &&
          riskReport.borrowers.length > 0 &&
          riskReport.aggregated?.allBorrowers && (
            <CreditRiskMetricsTable
              reportType={riskReport.reportType}
              borrowers={riskReport.borrowers}
              aggregated={riskReport.aggregated.allBorrowers}
            />
          )}

        {/* Historical Performance Charts */}
        {riskReport.borrowers &&
          riskReport.borrowers.length > 0 &&
          riskReport.aggregated?.allBorrowers && (
            <HistoricalCharts
              reportType={riskReport.reportType}
              borrowers={riskReport.borrowers}
              aggregated={riskReport.aggregated.allBorrowers}
            />
          )}
      </Stack>
    )
  }

  // Coming soon content for non-default chains
  const renderComingSoon = () => (
    <CustomCard sx={{ mt: 3 }}>
      <CustomCardHeader title='Risk Reporting' />
      <WaveBox borderRadius={2}>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight={200}
          textAlign='center'
          px={3}
          py={4}
        >
          <Typography variant='h5' color='gold.dark' mb={2}>
            Coming Soon to {chainConfig.name}
          </Typography>
          <Typography variant='baseMd' color='white'>
            Risk reporting for {chainConfig.name} pools is not yet available.
          </Typography>
        </Box>
      </WaveBox>
    </CustomCard>
  )

  // Before mount, match server rendering
  if (!hasMounted) {
    return renderContent(serverRiskReport)
  }

  // On default chain, use server data
  if (isDefaultChain) {
    return renderContent(serverRiskReport)
  }

  // On non-default chains, show coming soon
  return renderComingSoon()
}

export default RiskReportingTabChainWrapper
