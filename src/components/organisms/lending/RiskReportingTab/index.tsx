import { Stack } from '@mui/material'

import ArrearsCharts from '@/components/organisms/lending/RiskReportingTab/ArrearsCharts'
import BorrowerSchedule from '@/components/organisms/lending/RiskReportingTab/BorrowerSchedule'
import CreditRiskMetricsTable from '@/components/organisms/lending/RiskReportingTab/CreditRiskMetricsTable'
import DTIConcentrationTable from '@/components/organisms/lending/RiskReportingTab/DTIConcentrationTable'
import HistoricalCharts from '@/components/organisms/lending/RiskReportingTab/HistoricalCharts'
import RiskReportingTabSkeleton from '@/components/organisms/lending/RiskReportingTab/RiskReportingTabSkeleton'
import SummaryDashboard from '@/components/organisms/lending/RiskReportingTab/SummaryDashboard'

import { getRiskReport } from '@/app/_requests/riskReport'

type RiskReportingProps = {
  poolId: string
}

const RiskReportingTab: React.FC<RiskReportingProps> = async ({ poolId }) => {
  const riskReport = await getRiskReport(poolId)

  if (!riskReport) return <RiskReportingTabSkeleton />

  return (
    <Stack spacing={3} mt={3}>
      {/* Risk Summary Dashboard */}
      {riskReport && riskReport.summaryData && (
        <SummaryDashboard
          summaryData={riskReport.summaryData}
          reportType={riskReport.reportType}
        />
      )}

      {/* Borrower/Duration Schedule Table */}
      {riskReport &&
        riskReport.borrowers &&
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
      {riskReport &&
        riskReport.agingBuckets &&
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
      {riskReport && (
        <DTIConcentrationTable reportType={riskReport.reportType} />
      )}

      {/* Credit Risk Metrics Table */}
      {riskReport &&
        riskReport.borrowers &&
        riskReport.borrowers.length > 0 &&
        riskReport.aggregated?.allBorrowers && (
          <CreditRiskMetricsTable
            reportType={riskReport.reportType}
            borrowers={riskReport.borrowers}
            aggregated={riskReport.aggregated.allBorrowers}
          />
        )}

      {/* Historical Performance Charts */}
      {riskReport &&
        riskReport.borrowers &&
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

export default RiskReportingTab
