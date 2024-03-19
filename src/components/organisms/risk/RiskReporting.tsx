import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'

import TableSkeleton from '@/components/molecules/loaders/TableSkeleton'
import BadDebtsTable from '@/components/molecules/risk/BadDebtsTable'
import PoolCreditTable from '@/components/molecules/risk/PoolCreditTable'
import ReportingTable from '@/components/molecules/risk/ReportingTable'

const RiskReporting: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Box mt={3}>
      {loading ? (
        <>
          <TableSkeleton columns={4} rows={3} />
          <TableSkeleton columns={3} rows={4} />
          <TableSkeleton columns={3} rows={4} />
        </>
      ) : (
        <>
          <PoolCreditTable />
          <BadDebtsTable />
          <ReportingTable />
        </>
      )}
    </Box>
  )
}

export default RiskReporting
