import { Box } from '@mui/material'
import React from 'react'

import BadDebtsTable from '@/components/molecules/risk/badDebtsTable'
import PoolCreditTable from '@/components/molecules/risk/PoolCreditTable'

const RiskReporting: React.FC = () => {
  return (
    <Box mt={3}>
      <PoolCreditTable />
      <BadDebtsTable />
    </Box>
  )
}

export default RiskReporting
