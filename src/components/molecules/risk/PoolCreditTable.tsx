import {
  Card,
  CardContent,
  CardHeader,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { PoolCreditMetricsDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTable, {
  CustomTableHeader,
  Sort,
} from '@/components/molecules/CustomTable'

import { formatAmount, formatPercentage } from '@/utils'

const handleSort = (
  _a: PoolCreditMetricsDirectus,
  _b: PoolCreditMetricsDirectus,
  _sort: Sort<string[]>
): number => {
  return 0
}

interface PoolCreditTableProps {
  data: PoolCreditMetricsDirectus[]
}

const PoolCreditTable: React.FC<PoolCreditTableProps> = ({ data }) => {
  const { t } = useTranslation()

  const headers: CustomTableHeader<string[]>[] = useMemo(
    () => [
      {
        label: t('risk.poolCredit.headers.column-1'),
        value: 'keyCreditMetric',
        disableSort: true,
        styles: { width: '47%', fontSize: '14px', fontFamily: 'Barlow' },
      },
      {
        label: t('risk.poolCredit.headers.column-2'),
        value: 'previousFiscalYear',
        disableSort: true,
        styles: { width: '17%', fontSize: '14px', fontFamily: 'Barlow' },
      },
      {
        label: t('risk.poolCredit.headers.column-3'),
        value: 'mostRecentQuarter',
        disableSort: true,
        styles: { width: '19%', fontSize: '14px', fontFamily: 'Barlow' },
      },
      {
        label: t('risk.poolCredit.headers.column-4'),
        value: 'priorMonth',
        disableSort: true,
        styles: { width: '17%', fontSize: '14px', fontFamily: 'Barlow' },
      },
    ],
    [t]
  )

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title={
          <Typography variant='h6'>{t('risk.poolCredit.title')}</Typography>
        }
      />
      <CardContent sx={{ padding: 2 }}>
        <CustomTable
          headers={headers}
          data={data}
          pagination={false}
          defaultSortKey='poolIdFK'
          handleSort={handleSort}
          sortKeys={[]}
          headersStyle={{
            '& .MuiTableCell-root': {
              py: '6px',
              px: 2,
            },
          }}
        >
          {(sortedData) =>
            sortedData.map((data, index) => (
              <TableRow key={index}>
                <TableCell width='30%' align='left'>
                  {data.keyCreditMetric}
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body1'>
                    {index < 2
                      ? `${formatAmount(data.previousFiscalYear || '0')} x`
                      : formatPercentage(data.previousFiscalYear)}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body1'>
                    {index < 2
                      ? `${formatAmount(data.mostRecentQuarter || '0')} x`
                      : formatPercentage(data.mostRecentQuarter)}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body1'>
                    {index < 2
                      ? `${formatAmount(data.priorMonth || '0')} x`
                      : formatPercentage(data.priorMonth)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))
          }
        </CustomTable>
      </CardContent>
    </Card>
  )
}

export default PoolCreditTable
