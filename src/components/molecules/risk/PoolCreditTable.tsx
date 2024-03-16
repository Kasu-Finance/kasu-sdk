import { Card, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/customTable'
import { CustomTableHeader } from '@/components/molecules/customTable/TableHeaders'

import { PoolCreditTableKeys } from '@/constants/riskReporting'
import { sortByString } from '@/utils'

type PoolCreditData = {
  keyMetric: string
  previousFiscalYear: number
  mostRecentQuarter: number
  priorMonth: number
}

const mockData: PoolCreditData[] = [
  {
    keyMetric: 'Net Income',
    previousFiscalYear: 0.5,
    mostRecentQuarter: 25000,
    priorMonth: 5000,
  },
  {
    keyMetric: 'Net Income 2',
    previousFiscalYear: 2.5,
    mostRecentQuarter: 2,
    priorMonth: 12,
  },
  {
    keyMetric: 'Net Income 3',
    previousFiscalYear: 1.5,
    mostRecentQuarter: 132,
    priorMonth: 4353,
  },
]

const PoolCreditTable: React.FC = () => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<PoolCreditData>[] = [
    {
      label: t('risk.poolCredit.metrics.metric-1'),
      value: PoolCreditTableKeys.KEY_METRIC,
      disableSort: true,
    },
    {
      label: t('risk.poolCredit.metrics.metric-2'),
      value: PoolCreditTableKeys.PREVIOUS_FISCAL_YEAR,
      disableSort: true,
    },
    {
      label: t('risk.poolCredit.metrics.metric-3'),
      value: PoolCreditTableKeys.RECENT_QUARTER,
      disableSort: true,
    },
    {
      label: t('risk.poolCredit.metrics.metric-4'),
      value: PoolCreditTableKeys.PRIOR_MONTH,
      disableSort: true,
    },
  ]

  const handleSort = (
    a: PoolCreditData,
    b: PoolCreditData,
    sort: Sort<PoolCreditData>
  ): number => {
    if (typeof a[sort.key] === 'string' && typeof b[sort.key] === 'string') {
      return sortByString<PoolCreditData>(sort.key, sort.direction)(a, b)
    }
    return 0
  }

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2 }} elevation={1}>
      <Typography variant='h6' component='h2' mb={3}>
        {t('risk.poolCredit.title')}
      </Typography>

      <CustomTable
        headers={headers}
        data={mockData}
        pagination={false}
        defaultSortKey={PoolCreditTableKeys.KEY_METRIC}
        handleSort={handleSort}
        headersStyle={{
          '& > *': {
            p: 1,
            pl: 2,
            pr: 2,
          },
        }}
      >
        {(sortedData) =>
          sortedData.map((data, index) => (
            <TableRow key={index}>
              <TableCell width='30%' align='left'>
                {data.keyMetric}
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {`${data.previousFiscalYear} ${index < 2 ? 'x' : '%'}`}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {`${data.previousFiscalYear} ${index < 2 ? 'x' : '%'}`}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {`${data.previousFiscalYear} ${index < 2 ? 'x' : '%'}`}
                </Typography>
              </TableCell>
            </TableRow>
          ))
        }
      </CustomTable>
    </Card>
  )
}

export default PoolCreditTable
