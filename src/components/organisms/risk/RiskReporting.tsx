import { Box } from '@mui/material'
import { useParams } from 'next/navigation'
import React from 'react'

import useDoubtfulDebts from '@/hooks/lending/useDoubtfulDebts'
import useFinancialReporting from '@/hooks/lending/useFinancialReporting'
import usePoolCreditMetric from '@/hooks/lending/usePoolCreditMetric'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import TableSkeleton from '@/components/molecules/loaders/TableSkeleton'
import BadDebtsTable from '@/components/molecules/risk/BadDebtsTable'
import PoolCreditTable from '@/components/molecules/risk/PoolCreditTable'
import ReportingTable from '@/components/molecules/risk/ReportingTable'

const RiskReporting: React.FC = () => {
  const { slug } = useParams() as { slug: string }
  const poolId = slug

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

  if (noData) {
    return <EmptyCardState message='No data available for this pool.' />
  }

  return (
    <Box mt={3}>
      {poolCreditHook.data && <PoolCreditTable data={poolCreditHook.data} />}

      {doubtfulHook.data?.length && <BadDebtsTable data={doubtfulHook.data} />}

      {reportingHook.data?.length && (
        <ReportingTable data={reportingHook.data} />
      )}
    </Box>
  )
}

export default RiskReporting
