import { TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

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
  const { t } = useTranslation()

  return (
    <>
      {averageAndTotalRows.map((row, index) => (
        <TableRow key={index}>
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
            {row.name === RowName.Average && (
              <Typography
                variant='caption'
                component='span'
                textTransform='capitalize'
                fontSize={10}
              >
                {t('general.perPool')}
              </Typography>
            )}
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
              <Typography
                variant='caption'
                component='span'
                textTransform='capitalize'
                fontSize={10}
              >
                {t('general.perPool')}
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
              <Typography
                variant='caption'
                component='span'
                textTransform='capitalize'
                fontSize={10}
              >
                {t('general.perPool')}
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
              <Typography
                variant='caption'
                component='span'
                textTransform='capitalize'
                fontSize={10}
              >
                {t('general.weighted')}
              </Typography>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default ClosedPoolsTableFooter
