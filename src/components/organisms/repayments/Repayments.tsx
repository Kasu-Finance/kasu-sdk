import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'

import TableSkeleton from '@/components/molecules/loaders/TableSkeleton'
import RepaymentsView from '@/components/molecules/repayments/RepaymentsView'

const Repayments: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Box mt={3}>
      {loading ? <TableSkeleton columns={3} rows={5} /> : <RepaymentsView />}
    </Box>
  )
}

export default Repayments
