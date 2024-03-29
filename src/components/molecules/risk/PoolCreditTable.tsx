import { Card, TableCell, TableRow, Typography } from '@mui/material'
import { PoolCreditMetricsDirectus } from 'kasu-sdk/src/services/DataService/directus-types'
import React, { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import { CustomTableHeader } from '@/components/molecules/CustomTable/TableHeaders'

const handleSort = (
  _a: PoolCreditMetricsDirectus,
  _b: PoolCreditMetricsDirectus,
  _sort: Sort<PoolCreditMetricsDirectus>
): number => {
  return 0
}

interface PoolCreditTableProps {
  data: PoolCreditMetricsDirectus[]
}

const PoolCreditTable: React.FC<PoolCreditTableProps> = ({ data }) => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<PoolCreditMetricsDirectus>[] = useMemo(
    () => [
      {
        label: t('risk.poolCredit.headers.column-1'),
        value: 'poolIdFK',
        disableSort: true,
      },
      {
        label: t('risk.poolCredit.headers.column-2'),
        value: 'icrPreviousFiscalYear',
        disableSort: true,
      },
      {
        label: t('risk.poolCredit.headers.column-3'),
        value: 'icrRecentQuarter',
        disableSort: true,
      },
      {
        label: t('risk.poolCredit.headers.column-4'),
        value: 'icrPriorMonth',
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
        data={data}
        pagination={false}
        defaultSortKey='poolIdFK'
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
                {data.poolIdFK}
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {`${data.icrPreviousFiscalYear} ${index < 2 ? 'x' : '%'}`}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {`${data.icrRecentQuarter} ${index < 2 ? 'x' : '%'}`}
                </Typography>
              </TableCell>
              <TableCell align='right'>
                <Typography variant='body1'>
                  {`${data.icrPriorMonth} ${index < 2 ? 'x' : '%'}`}
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
