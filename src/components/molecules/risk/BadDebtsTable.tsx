import { Theme } from '@emotion/react'
import { Card, SxProps, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/customTable'
import { CustomTableHeader } from '@/components/molecules/customTable/TableHeaders'

import { mockBadDebtData } from '@/app/mock-data/risk-data'
import { BadDebtsTableKeys } from '@/constants/riskReporting'
import { sortByString } from '@/utils'

const headersStyles: SxProps<Theme> = {
  '& > *': {
    pt: 1.5,
    pb: 1,
    textAlign: 'center',
    '&:first-child': {
      borderBottom: 'none',
    },
  },
}

const additionalHeadersStyles: SxProps<Theme> = {
  '& > *': {
    textAlign: 'center',
    width: '40%',
    p: 1,
  },
}

export type BadDebtTableData = {
  category: string
  empty: string
  totalAmount: number
  totalAmountSuffix: string
  monthlyAverage: number
  monthlyAverageSuffix: string
  currentStatus: string
  currentStatusSuffix: string
}

const BadDebtsTable: React.FC = () => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<BadDebtTableData>[] = [
    {
      label: '',
      value: BadDebtsTableKeys.CATEGORY,
      disableSort: true,
    },
    {
      label: t('risk.badDebts.totalAmount'),
      value: BadDebtsTableKeys.TOTAL_AMOUNT,
      disableSort: true,
    },
    {
      label: '',
      value: BadDebtsTableKeys.EMPTY,
      disableSort: true,
    },
    {
      label: t('risk.badDebts.monthlyAverage'),
      value: BadDebtsTableKeys.MONTHLY_AVERAGE,
      disableSort: true,
    },
    {
      label: '',
      value: BadDebtsTableKeys.EMPTY,
      disableSort: true,
    },
    {
      label: t('risk.badDebts.currentStatus'),
      value: BadDebtsTableKeys.CURRENT_STATUS,
      disableSort: true,
    },
    {
      label: '',
      value: BadDebtsTableKeys.EMPTY,
      disableSort: true,
    },
  ]

  const additionalHeaders: CustomTableHeader<BadDebtTableData>[] = [
    {
      label: '',
      value: BadDebtsTableKeys.CATEGORY,
      disableSort: true,
    },
    {
      label: 'Amount',
      value: BadDebtsTableKeys.TOTAL_AMOUNT,
      disableSort: true,
    },
    {
      label: '%',
      value: BadDebtsTableKeys.TOTAL_AMOUNT_SUFFIX,
      disableSort: true,
    },
    {
      label: 'Amount',
      value: BadDebtsTableKeys.MONTHLY_AVERAGE,
      disableSort: true,
    },
    {
      label: '%',
      value: BadDebtsTableKeys.MONTHLY_AVERAGE_SUFFIX,
      disableSort: true,
    },
    {
      label: 'Amount',
      value: BadDebtsTableKeys.CURRENT_STATUS,
      disableSort: true,
    },
    {
      label: '%',
      value: BadDebtsTableKeys.CURRENT_STATUS_SUFFIX,
      disableSort: true,
    },
  ]

  const handleSort = (
    a: BadDebtTableData,
    b: BadDebtTableData,
    sort: Sort<BadDebtTableData>
  ): number => {
    if (typeof a[sort.key] === 'string' && typeof b[sort.key] === 'string') {
      return sortByString<BadDebtTableData>(sort.key, sort.direction)(a, b)
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
        defaultSortKey={BadDebtsTableKeys.CATEGORY}
        handleSort={handleSort}
        headersStyle={headersStyles}
        additionalHeadersStyle={additionalHeadersStyles}
      >
        {(sortedData) =>
          sortedData.map((data, index) => (
            <TableRow key={index}>
              <TableCell align='left' width='10%'>
                {data.category}
              </TableCell>
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
