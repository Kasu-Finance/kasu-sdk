import { TableCell, TableRow } from '@mui/material'
import { BadAndDoubtfulDebtsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'

import useTranslation from '@/hooks/useTranslation'

import DataTypography from '@/components/molecules/risk/BadDebtsTable/DataTypography'

type BadDebtsMobileRowProps = {
  data: Pick<
    BadAndDoubtfulDebtsDirectus,
    'id' | 'poolIdFK' | 'name' | 'tooltip'
  > & {
    totalAmount: string
    totalPercentage: string
    monthlyAverageAmount: string
    monthlyAveragePercentage: string
    currentStatusAmount: string
    currentStatusPercentage: string
  }
}
const BadDebtsMobileRow: React.FC<BadDebtsMobileRowProps> = ({ data }) => {
  const { t } = useTranslation()

  const isArrears = data.name === 'Arrears'

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
        <TableCell align='left'>
          <DataTypography data={data.name} toolTip={data.tooltip} />
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
        <TableCell width='60%'>
          {t('risk.badDebts.headers.column-3')} {t('general.amount')}
        </TableCell>
        <TableCell width='40%'> {!isArrears && '%'}</TableCell>
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
        <TableCell>{data.currentStatusAmount}</TableCell>
        <TableCell>{!isArrears && data.currentStatusPercentage}</TableCell>
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
        <TableCell>{!isArrears && '%'}</TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            '.MuiTableCell-root': {
              p: 0,
              pb: isArrears ? 1 : 2,
              border: isArrears ? undefined : 'none',
              fontSize: 12,
              borderColor: '#E0C19C',
            },
          },
        })}
      >
        <TableCell>{data.monthlyAverageAmount}</TableCell>
        <TableCell>{!isArrears && data.monthlyAveragePercentage}</TableCell>
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
      )}
    </>
  )
}

export default BadDebtsMobileRow
