import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'

import TableSkeleton from '@/components/molecules/loaders/TableSkeleton'
import RepaymentsTable from '@/components/molecules/repayments/RepaymentsTable'

import repayments from '@/app/mock-data/repayments-data'

const Repayments: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Box>
      {loading ? (
        <TableSkeleton columns={3} rows={5} />
      ) : (
        <RepaymentsTable data={repayments} />
      )}
    </Box>
  )
}

export default Repayments
