import { Card, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/customTable/TableHeaders'

import { sortByString } from '@/utils'

type BadDebtData = {
  empty: string
  totalAmount: number
  totalAmountSuffix: string
  monthlyAverage: number
  monthlyAverageSuffix: string
  currentStatus: string
  currentStatusSuffix: string
}

const mockBadDebtData: BadDebtData[] = [
  {
    empty: 'Arrears',
    totalAmount: 11,
    totalAmountSuffix: 'totalAmountSuffix',
    monthlyAverage: 200,
    monthlyAverageSuffix: 'N/A',
    currentStatus: 'Low',
    currentStatusSuffix: 'N/A',
  },
  {
    empty: 'Defaults',
    totalAmount: 11,
    totalAmountSuffix: 'totalAmountSuffix',
    monthlyAverage: 200,
    monthlyAverageSuffix: 'N/A',
    currentStatus: 'Low',
    currentStatusSuffix: 'N/A',
  },
  {
    empty: 'Recovery Action - Unrealised Losses',
    totalAmount: 11,
    totalAmountSuffix: 'totalAmountSuffix',
    monthlyAverage: 200,
    monthlyAverageSuffix: 'N/A',
    currentStatus: 'Low',
    currentStatusSuffix: 'N/A',
  },
  {
    empty: 'Realised Losses',
    totalAmount: 11,
    totalAmountSuffix: 'totalAmountSuffix',
    monthlyAverage: 200,
    monthlyAverageSuffix: 'N/A',
    currentStatus: 'Low',
    currentStatusSuffix: 'N/A',
  },
]

const BadDebtsTable: React.FC = () => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<BadDebtData>[] = [
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },
    {
      label: t('risk.badDebts.totalAmount'),
      value: 'totalAmount',
      disableSort: true,
    },
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },
    {
      label: t('risk.badDebts.monthlyAverage'),
      value: 'monthlyAverage',
      disableSort: true,
    },
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },

    {
      label: t('risk.badDebts.currentStatus'),
      value: 'currentStatus',
      disableSort: true,
    },
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },
  ]

  const additionalHeaders: CustomTableHeader<BadDebtData>[] = [
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },
    {
      label: 'Amount',
      value: 'totalAmount',
      disableSort: true,
    },
    {
      label: '%',
      value: 'totalAmountSuffix',
      disableSort: true,
    },
    {
      label: 'Amount',
      value: 'monthlyAverage',
      disableSort: true,
    },
    {
      label: '%',
      value: 'monthlyAverageSuffix',
      disableSort: true,
    },
    {
      label: 'Amount',
      value: 'currentStatus',
      disableSort: true,
    },
    {
      label: '%',
      value: 'currentStatusSuffix',
      disableSort: true,
    },
  ]

  const handleSort = (
    a: BadDebtData,
    b: BadDebtData,
    sort: Sort<BadDebtData>
  ): number => {
    if (typeof a[sort.key] === 'string' && typeof b[sort.key] === 'string') {
      return sortByString<BadDebtData>(sort.key, sort.direction)(a, b)
    }
    return 0
  }

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' component='h2' mb={3}>
        {t('risk.badDebts.title')}
      </Typography>

      <CustomTable
        headers={headers}
        additionalHeaders={additionalHeaders}
        data={mockBadDebtData}
        pagination={false}
        defaultSortKey='empty'
        handleSort={handleSort}
        tableRowStyle={{
          '& > *': {
            textAlign: 'center',
          },
        }}
        additionalHeadersStyle={{
          '& > *': {
            textAlign: 'center',
            width: '100%',
          },
        }}
      >
        {(sortedData) =>
          sortedData.map((data, index) => (
            <TableRow key={index}>
              <TableCell align='left'>{data.empty}</TableCell>
              <TableCell align='center'>{data.totalAmount}</TableCell>
              <TableCell align='center'>{data.totalAmountSuffix}</TableCell>
              <TableCell align='center'>{data.monthlyAverage}</TableCell>
              <TableCell align='center'>{data.monthlyAverageSuffix}</TableCell>
              <TableCell align='center'>{data.currentStatus}</TableCell>
              <TableCell align='center'>{data.currentStatusSuffix}</TableCell>
            </TableRow>
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default BadDebtsTable
