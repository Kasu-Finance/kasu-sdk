import { Theme } from '@emotion/react'
import { Card, SxProps, TableCell, TableRow, Typography } from '@mui/material'
import { BadAndDoubtfulDebtsDirectus } from 'kasu-sdk/src/services/DataService/directus-types'
import { BadAndDoubtfulDebts } from 'kasu-sdk/src/services/DataService/types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'
import DataTypography from '@/components/molecules/risk/BadDebtsTable/DataTypography'

import { BadDebtsTableKeys } from '@/constants/riskReporting'

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

const handleSort = (
  _a: BadAndDoubtfulDebtsDirectus,
  _b: BadAndDoubtfulDebtsDirectus,
  _sort: Sort<BadAndDoubtfulDebtsDirectus>
): number => {
  return 0
}

interface BadDebtsTableProps {
  data: BadAndDoubtfulDebts[]
}

const BadDebtsTable: React.FC<BadDebtsTableProps> = ({ data }) => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<BadAndDoubtfulDebtsDirectus>[] = [
    {
      label: '',
      value: 'category', // Assuming 'category' is a valid key in BadAndDoubtfulDebtsDirectus
      disableSort: true,
    },
    {
      label: t('risk.badDebts.headers.column-1'),
      value: 'totalAmount', // Replace with actual key from BadAndDoubtfulDebtsDirectus
      disableSort: true,
    },
    {
      label: '',
      value: 'empty', // If 'empty' is not a key, consider using a placeholder or omitting this header
      disableSort: true,
    },
    {
      label: t('risk.badDebts.headers.column-2'),
      value: 'monthlyAverage', // Replace with actual key from BadAndDoubtfulDebtsDirectus
      disableSort: true,
    },
    {
      label: '',
      value: 'empty', // Same note as above
      disableSort: true,
    },
    {
      label: t('risk.badDebts.headers.column-3'),
      value: 'currentStatus', // Replace with actual key from BadAndDoubtfulDebtsDirectus
      disableSort: true,
    },
    {
      label: '',
      value: 'empty', // Same note as above
      disableSort: true,
    },
  ]

  const additionalHeaders: CustomTableHeader<BadAndDoubtfulDebtsDirectus>[] = [
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

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' component='h2' mb={3}>
        {t('risk.badDebts.title')}
      </Typography>

      <CustomTable
        headers={headers}
        additionalHeaders={additionalHeaders}
        data={data}
        pagination={false}
        defaultSortKey='arrearsCurrentStatus'
        handleSort={handleSort}
        headersStyle={headersStyles}
        additionalHeadersStyle={additionalHeadersStyles}
      >
        {(sortedData) =>
          sortedData.map((data, index) => (
            <TableRow key={index}>
              <TableCell align='left' width='10%'>
                <DataTypography data={data.arrearsCurrentStatus} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.lossesLifetime} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.arrearsMonthlyAverage} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.lossesMonthlyAverage} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.lossesCurrentStatus} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.arrearsCurrentStatus} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.defaultsCurrentStatus} />
              </TableCell>
            </TableRow>
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default BadDebtsTable
