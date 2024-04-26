import { alpha, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import { formatPercentage } from '@/utils'

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
    <>
      {averageAndTotalRows.map((row, index) => (
        <TableRow
          key={index}
          sx={(theme) => ({
            background: alpha(theme.palette.primary.main, 0.04),
          })}
        >
          <TableCell align='left'>
            <Typography variant='subtitle2'>{row.name}</Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography variant='h6'>{row.apy}</Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography variant='h6'>
              {`${row.totalValueLocked} M`}
              <Typography variant='body2' component='span'>
                {' '}
                USDC
              </Typography>
            </Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography variant='h6'>
              {`${row.loansUnderManagement} M`}
              <Typography variant='body2' component='span'>
                {' '}
                USDC
              </Typography>
            </Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography variant='h6'>
              {`${row.totalFunds} M`}
              <Typography variant='body2' component='span'>
                {' '}
                USDC
              </Typography>
            </Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography variant='h6'>
              {row.name === 'Total'
                ? row?.totalLossRate
                : formatPercentage(row?.totalLossRate) || 0}
            </Typography>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default ClosedPoolsTableFooter
