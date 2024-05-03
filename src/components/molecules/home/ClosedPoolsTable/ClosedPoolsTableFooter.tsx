import { alpha, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import { formatPercentage } from '@/utils'

enum RowName {
  Average = 'Average',
  Total = 'Total',
}

const averageAndTotalRows = [
  {
    name: RowName.Average,
    apy: 'Text',
    totalValueLocked: 10,
    loansUnderManagement: 10,
    totalFunds: 10,
    totalLossRate: 5,
  },
  {
    name: RowName.Total,
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
            <Typography variant='subtitle1' color='text.primary'>
              {row.apy}
            </Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography variant='subtitle1' color='text.primary'>
              {`${row.totalValueLocked} M`}
              <Typography variant='body2' component='span'>
                {' '}
                USDC
              </Typography>
            </Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography variant='subtitle1' color='text.primary'>
              {`${row.loansUnderManagement} M`}
              <Typography variant='body2' component='span'>
                {' '}
                USDC
              </Typography>
            </Typography>
            {row.name === RowName.Average && (
              <Typography variant='caption' component='span'>
                Per Pool
              </Typography>
            )}
          </TableCell>
          <TableCell align='right'>
            <Typography variant='subtitle1' color='text.primary'>
              {`${row.totalFunds} M`}
              <Typography variant='body2' component='span'>
                {' '}
                USDC
              </Typography>
            </Typography>
            {row.name === RowName.Average && (
              <Typography variant='caption' component='span'>
                Per Pool
              </Typography>
            )}
          </TableCell>
          <TableCell align='right'>
            <Typography variant='subtitle1' color='text.primary'>
              {row.name === RowName.Total
                ? row?.totalLossRate
                : formatPercentage(row?.totalLossRate) || '0%'}
            </Typography>
            {row.name === RowName.Average && (
              <Typography variant='caption' component='span'>
                Weighted
              </Typography>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default ClosedPoolsTableFooter
