import { TableCell, TableRow, Typography } from '@mui/material'
import { BadAndDoubtfulDebts } from '@solidant/kasu-sdk/src/services/DataService/types'

import DataTypography from '@/components/molecules/risk/BadDebtsTable/DataTypography'

import { formatAmount } from '@/utils'

type BadDebtsMobileRowProps = {
  data: BadAndDoubtfulDebts['items'][number]
}
const BadDebtsMobileRow: React.FC<BadDebtsMobileRowProps> = ({ data }) => {
  const isNumber = (data: any): data is number => {
    return typeof data === 'number' && !isNaN(data)
  }

  return (
    <>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              px: 0,
              pb: 1,
              border: 'none',
            },
          },
        })}
      >
        <TableCell align='left' colSpan={3}>
          <DataTypography
            data={data.item.name}
            toolTip={data.item.tooltip}
            isLabel
          />
        </TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              border: 'none',
              fontSize: 10,
              textTransform: 'capitalize',
            },
          },
        })}
      >
        <TableCell>
          <Typography variant='caption' fontSize={10}>
            Period
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant='caption' fontSize={10}>
            {data.item.unit ?? 'USD'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant='caption' fontSize={10}>
            {data.item.unit ? '' : '%'}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              border: 'none',
              fontSize: 10,
              textTransform: 'capitalize',
            },
          },
        })}
      >
        <TableCell>Current Status</TableCell>
        <TableCell>
          {isNumber(data.currentAmount)
            ? formatAmount(data.currentAmount)
            : 'N/A'}
        </TableCell>
        <TableCell>
          {isNumber(data.currentPercentage)
            ? formatAmount(data.currentPercentage)
            : data.item.unit
              ? ''
              : 'N/A'}
        </TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              border: 'none',
              fontSize: 10,
              textTransform: 'capitalize',
            },
          },
        })}
      >
        <TableCell>Monthly Average (LTM)</TableCell>
        <TableCell>
          {isNumber(data.monthlyAverageAmount)
            ? formatAmount(data.monthlyAverageAmount)
            : 'N/A'}
        </TableCell>
        <TableCell>
          {isNumber(data.monthlyAveragePercentage)
            ? formatAmount(data.monthlyAveragePercentage)
            : data.item.unit
              ? ''
              : 'N/A'}
        </TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              border: 'none',
              fontSize: 10,
              textTransform: 'capitalize',
            },
          },
        })}
      >
        <TableCell>Lifetime</TableCell>
        <TableCell>
          {isNumber(data.totalLifetimeAmount)
            ? formatAmount(data.totalLifetimeAmount)
            : 'N/A'}
        </TableCell>
        <TableCell>
          {isNumber(data.totalLifetimePercentage)
            ? formatAmount(data.totalLifetimePercentage)
            : data.item.unit
              ? ''
              : 'N/A'}
        </TableCell>
      </TableRow>
      {/* 
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              border: 'none',
              fontSize: 10,
              textTransform: 'capitalize',
            },
          },
        })}
      >
        <TableCell width='60%'>
          {t('risk.badDebts.headers.column-3')} {t('general.amount')}
        </TableCell>
        <TableCell width='40%'> {data.item.unit?? '%'}</TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              pb: 2,
              border: 'none',
              fontSize: 12,
            },
          },
        })}
      >
        <TableCell>{data.currentAmount}</TableCell>
        <TableCell>{data.currentPercentage}</TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              border: 'none',
              fontSize: 10,
              textTransform: 'capitalize',
            },
          },
        })}
      >
        <TableCell>
          {t('risk.badDebts.headers.column-2')}{' '}
          {t('risk.badDebts.headers.column-2-suffix')}
        </TableCell>
        <TableCell>{data.item.unit?? '%'}</TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              // pb: isArrears ? 1 : 2,
              // border: isArrears ? undefined : 'none',
              fontSize: 12,
              borderColor: '#E0C19C',
            },
          },
        })}
      >
        <TableCell>{data.monthlyAverageAmount}</TableCell>
        <TableCell>{data.monthlyAveragePercentage}</TableCell>
      </TableRow>
      {!isArrears && (
        <>
          <TableRow
            sx={(theme) => ({
              [theme.breakpoints.down('sm')]: {
                '.MuiTableCell-root': {
                  p: 0,
                  border: 'none',
                  fontSize: 10,
                  textTransform: 'capitalize',
                },
              },
            })}
          >
            <TableCell>
              {t('risk.badDebts.headers.column-1')}{' '}
              {t('risk.badDebts.headers.column-1-suffix')} {t('general.amount')}
            </TableCell>
            <TableCell>%</TableCell>
          </TableRow>
          <TableRow
            sx={(theme) => ({
              [theme.breakpoints.down('sm')]: {
                '.MuiTableCell-root': {
                  px: 0,
                  pt: 0,
                  fontSize: 12,
                  borderColor: '#E0C19C',
                },
              },
            })}
          >
            <TableCell>{data.totalAmount}</TableCell>
            <TableCell>{data.totalPercentage}</TableCell>
          </TableRow>
        </>
      )} */}
    </>
  )
}

export default BadDebtsMobileRow
