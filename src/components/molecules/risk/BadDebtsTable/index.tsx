import { Theme } from '@emotion/react'
import { Card, SxProps, TableCell, TableRow, Typography } from '@mui/material'
import { BadAndDoubtfulDebtsDirectus } from 'kasu-sdk/src/services/DataService/directus-types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'
import DataTypography from '@/components/molecules/risk/BadDebtsTable/DataTypography'

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
  _a: ExtendedBadAndDoubtfulDebts,
  _b: ExtendedBadAndDoubtfulDebts,
  _sort: Sort<ExtendedBadAndDoubtfulDebts>
): number => {
  return 0
}

interface BadDebtsTableProps {
  data: BadAndDoubtfulDebtsDirectus[]
}

export interface ExtendedBadAndDoubtfulDebts
  extends BadAndDoubtfulDebtsDirectus {
  empty: string
}

const BadDebtsTable: React.FC<BadDebtsTableProps> = ({ data }) => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<ExtendedBadAndDoubtfulDebts>[] = [
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },
    {
      label: t('risk.badDebts.headers.column-1'),
      value: 'totalAmount',
      disableSort: true,
    },
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },
    {
      label: t('risk.badDebts.headers.column-2'),
      value: 'monthlyAverageAmount',
      disableSort: true,
    },
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },
    {
      label: t('risk.badDebts.headers.column-3'),
      value: 'currentStatusAmount',
      disableSort: true,
    },
    {
      label: '',
      value: 'empty',
      disableSort: true,
    },
  ]

  const additionalHeaders: CustomTableHeader<ExtendedBadAndDoubtfulDebts>[] = [
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
      value: 'totalPercentage',
      disableSort: true,
    },
    {
      label: 'Amount',
      value: 'monthlyAverageAmount',
      disableSort: true,
    },
    {
      label: '%',
      value: 'currentStatusPercentage',
      disableSort: true,
    },
    {
      label: 'Amount',
      value: 'currentStatusAmount',
      disableSort: true,
    },
    {
      label: '%',
      value: 'currentStatusPercentage',
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
        data={data as ExtendedBadAndDoubtfulDebts[]}
        pagination={false}
        defaultSortKey='totalAmount'
        handleSort={handleSort}
        headersStyle={headersStyles}
        additionalHeadersStyle={additionalHeadersStyles}
      >
        {(sortedData) =>
          sortedData.map((data, index) => (
            <TableRow key={index}>
              <TableCell align='left' width='10%'>
                {/* TODO: add here right param instead of totalAmount */}
                <DataTypography data={data.totalAmount} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.totalAmount} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.totalPercentage} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.monthlyAverageAmount} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.monthlyAveragePercentage} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.currentStatusAmount} />
              </TableCell>
              <TableCell align='center'>
                <DataTypography data={data.currentStatusPercentage} />
              </TableCell>
            </TableRow>
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default BadDebtsTable
