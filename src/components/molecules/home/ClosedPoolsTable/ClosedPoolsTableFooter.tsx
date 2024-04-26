import { alpha, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import { formatPercentage } from '@/utils'

// TODO: Re-implement this when we have the data
const averageAndTotalRows = [
  {
    name: 'Average',
    apy: 'Text',
    totalValueLocked: 10,
    loansUnderManagement: 10,
    totalFunds: 10,
    totalLossRate: 5,
  },
  {
    name: 'Total',
    apy: 'Text',
    totalValueLocked: 10,
    loansUnderManagement: 10,
    totalFunds: 10,
    totalLossRate: 'Text',
  },
]

const ClosedPoolsTableFooter: React.FC = () => {
  return (
    <TableRow
      key={averageAndTotalRows.name}
      sx={(theme) => ({
        background: alpha(theme.palette.primary.main, 0.08),
      })}
    >
      <TableCell align='left'>
        <Typography variant='subtitle2'>{averageAndTotalRows.name}</Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='h6'>{averageAndTotalRows.apy}</Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='h6'>
          {averageAndTotalRows.totalValueLocked} M{' '}
          <Typography variant='body2' component='span'>
            USDC
          </Typography>
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='h6'>
          {averageAndTotalRows.loansUnderManagement} M{' '}
          <Typography variant='body2' component='span'>
            USDC
          </Typography>
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='h6'>
          {averageAndTotalRows.totalFunds} M{' '}
          <Typography variant='body2' component='span'>
            USDC
          </Typography>
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='h6'>
          {averageAndTotalRows.name === 'Total'
            ? averageAndTotalRows?.totalLossRate
            : formatPercentage(averageAndTotalRows?.totalLossRate) || 0}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default ClosedPoolsTableFooter
