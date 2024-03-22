import { Card, TableCell, TableRow, Typography } from '@mui/material'
import React, { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'

import { poolCreditMock } from '@/app/mock-data/risk-data'
import { PoolCreditTableKeys } from '@/constants/riskReporting'

const handleSort = (
  _a: PoolCreditData,
  _b: PoolCreditData,
  _sort: Sort<PoolCreditData>
): number => {
  return 0
}

export type PoolCreditData = {
  keyMetric: string
  previousFiscalYear: number
  mostRecentQuarter: number
  priorMonth: number
}

const PoolCreditTable: React.FC = () => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<PoolCreditData>[] = useMemo(
    () => [
      {
        label: t('risk.poolCredit.headers.column-1'),
        value: PoolCreditTableKeys.KEY_METRIC,
        disableSort: true,
      },
      {
        label: t('risk.poolCredit.headers.column-2'),
        value: PoolCreditTableKeys.PREVIOUS_FISCAL_YEAR,
        disableSort: true,
      },
      {
        label: t('risk.poolCredit.headers.column-3'),
        value: PoolCreditTableKeys.RECENT_QUARTER,
        disableSort: true,
      },
      {
        label: t('risk.poolCredit.headers.column-4'),
        value: PoolCreditTableKeys.PRIOR_MONTH,
        disableSort: true,
      },
    ],
    [t]
  )

  return (
    <Card sx={{ minWidth: 275, boxShadow: 1, padding: 2 }} elevation={1}>
      <Typography variant='h6' component='h2' mb={3}>
        {t('risk.poolCredit.title')}
      </Typography>

      <CustomTable
        headers={headers}
        data={poolCreditMock}
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
                  {`${data.mostRecentQuarter} ${index < 2 ? 'x' : '%'}`}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {`${data.priorMonth} ${index < 2 ? 'x' : '%'}`}
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
