import { Box } from '@mui/material'
import { FinancialReportingDocumentsDirectus } from 'kasu-sdk/src/services/DataService/directus-types'
import { BadAndDoubtfulDebts } from 'kasu-sdk/src/services/DataService/types'
import { useParams } from 'next/navigation'
import React from 'react'

import useDoubtfulDebts from '@/hooks/lending/useDoubtfulDebts'
import useFinancialReporting from '@/hooks/lending/useFinancialReporting'
import usePoolCreditMetric from '@/hooks/lending/usePoolCreditMetric'

import TableSkeleton from '@/components/molecules/loaders/TableSkeleton'
import BadDebtsTable from '@/components/molecules/risk/BadDebtsTable'
import PoolCreditTable from '@/components/molecules/risk/PoolCreditTable'
import ReportingTable from '@/components/molecules/risk/ReportingTable'

// BadAndDoubtfulDebtsDirectus Mock Array
const mockBadAndDoubtfulDebtsArray: BadAndDoubtfulDebts[] = [
  {
    id: '1',
    poolIdFK: 'pool1',
    arrearsMonthlyAverage: '2%',
    defaultsMonthlyAverage: '1.5%',
    recoveryActionMonthlyAverage: '2.5%',
    lossesMonthlyAverage: '1%',
    arrearsCurrentStatus: 'Stable',
    defaultsCurrentStatus: 'Increasing',
    recoveryActionCurrentStatus: 'Improving',
    lossesCurrentStatus: 'Decreasing',
    lossesLifetime: '5%',
  },
  // Additional objects can be added here
]

// FinancialReportingDocumentsDirectus Mock Array
const mockFinancialReportingDocuments: FinancialReportingDocumentsDirectus[] = [
  {
    id: '1',
    name: 'Annual Report 2020',
    description: 'Comprehensive financial report for the year 2020.',
    uploadTimestamp: 1614556800000, // Example timestamp for March 1, 2021
    version: 1,
    documentUrl: 'https://example.com/annual-report-2020.pdf',
    poolIdFK: 'pool1',
  },
  // Additional documents can be added here
]

const RiskReporting: React.FC = () => {
  const { slug } = useParams()
  const poolId = slug as string

  const doubtfulHook = useDoubtfulDebts(poolId)
  const poolCreditHook = usePoolCreditMetric(poolId)
  const reportingHook = useFinancialReporting(poolId)

  const isLoading =
    doubtfulHook.isLoading ||
    poolCreditHook.isLoading ||
    reportingHook.isLoading

  const noData =
    !isLoading &&
    !doubtfulHook.data &&
    !poolCreditHook.data &&
    !reportingHook.data

  if (isLoading) {
    return (
      <Box mt={3}>
        <TableSkeleton columns={4} rows={3} />
        <TableSkeleton columns={3} rows={4} />
        <TableSkeleton columns={3} rows={4} />
      </Box>
    )
  }

  // if (noData) {
  //   return <EmptyCardState message='No data available for this pool.' />
  // }

  return (
    <Box mt={3}>
      {poolCreditHook.data?.length && (
        <PoolCreditTable data={poolCreditHook.data} />
      )}

      {doubtfulHook.data?.length && (
        <BadDebtsTable data={poolCreditHook.data} />
      )}
      <BadDebtsTable data={mockBadAndDoubtfulDebtsArray} />

      {reportingHook.data?.length && (
        <ReportingTable data={reportingHook.data} />
      )}
    </Box>
  )
}

export default RiskReporting
