import { TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import type { AgingBuckets } from '@/types/riskReporting'

type BorrowerScheduleTableHeaderProps = {
  agingBuckets: AgingBuckets
}

// Total Funding column styling
const TOTAL_COLUMN_BG = '#5B5B60'

const BorrowerScheduleTableHeader: React.FC<
  BorrowerScheduleTableHeaderProps
> = ({ agingBuckets }) => {
  const bucketKeys = Object.keys(agingBuckets).sort(
    (a, b) => Number(a) - Number(b)
  )

  return (
    <TableRow sx={{ height: 100, '& .MuiTableCell-root': { py: 3, px: 2 } }}>
      <TableCell sx={{ minWidth: 120 }}>
        <Typography variant='baseSmBold' color='text.primary'>
          Borrower ID
        </Typography>
      </TableCell>
      {bucketKeys.map((key) => (
        <TableCell key={key} align='center'>
          <Typography variant='baseSm'>
            {agingBuckets[key].description}
          </Typography>
        </TableCell>
      ))}
      <TableCell
        align='right'
        sx={{ minWidth: 80, bgcolor: TOTAL_COLUMN_BG, color: '#FFFFFF' }}
      >
        <Typography variant='baseSmBold' color='inherit'>
          Total Funding
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default BorrowerScheduleTableHeader
